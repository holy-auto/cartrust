import { useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  Text,
  Button,
  Card,
  ActivityIndicator,
  Icon,
  Dialog,
  Portal,
} from "react-native-paper";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import NfcManager, { NfcTech, Ndef } from "react-native-nfc-manager";

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { mobileApi } from "@/lib/api";

type WriteState =
  | "idle"
  | "writing"
  | "verifying"
  | "locking"
  | "success"
  | "error";

const CERT_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_CERT_URL ?? "https://cert.ledra.co.jp";

interface CertificateInfo {
  id: string;
  certificate_no: string;
  public_id: string;
  customer_name: string | null;
  vehicle_maker: string | null;
  vehicle_model: string | null;
  plate_display: string | null;
  /** Resolved at fetch time. Non-null when the cert's vehicle has a VIN
   * with a published vehicle_passports row — write `/v/{vin}` instead of
   * `/c/{public_id}` so the same physical tag carries the cross-tenant
   * lifetime view. */
  passport_vin: string | null;
}

export default function NfcWriteScreen() {
  const { certificateId } = useLocalSearchParams<{ certificateId: string }>();
  const { user } = useAuthStore();

  const [writeState, setWriteState] = useState<WriteState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmVisible, setConfirmVisible] = useState(false);

  const { data: cert, isLoading } = useQuery({
    queryKey: ["certificate-for-write", certificateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select(
          "id, certificate_no, public_id, customer_name, vehicle_maker, vehicle_model, plate_display, vehicle_id"
        )
        .eq("id", certificateId)
        .eq("tenant_id", user!.tenantId)
        .single();
      if (error) throw error;

      // Look up the vehicle's normalized VIN and confirm a vehicle_passports
      // row exists. Only when both succeed do we redirect the NFC URL to
      // `/v/{vin}`; otherwise we fall back to the per-cert `/c/{public_id}`
      // page so the tag still resolves.
      let passport_vin: string | null = null;
      const vehicleId = (data as { vehicle_id?: string | null }).vehicle_id ?? null;
      if (vehicleId) {
        const { data: veh } = await supabase
          .from("vehicles")
          .select("vin_code_normalized, passport_opt_out")
          .eq("id", vehicleId)
          .single();
        const vin = veh?.vin_code_normalized ?? null;
        if (vin && !veh?.passport_opt_out) {
          const { data: passport } = await supabase
            .from("vehicle_passports")
            .select("vin_code_normalized")
            .eq("vin_code_normalized", vin)
            .maybeSingle();
          if (passport?.vin_code_normalized) passport_vin = passport.vin_code_normalized;
        }
      }

      return { ...(data as Omit<CertificateInfo, "passport_vin">), passport_vin } as CertificateInfo;
    },
    enabled: !!certificateId && !!user?.tenantId,
  });

  async function startWrite() {
    if (!cert?.public_id) {
      setErrorMessage("証明書のpublic_idが見つかりません");
      setWriteState("error");
      return;
    }

    setWriteState("writing");
    setErrorMessage("");

    // Prefer the vehicle passport URL when one exists — single tag carries
    // the cross-tenant lifetime view. Fall back to the per-cert page otherwise.
    const certUrl = cert.passport_vin
      ? `${CERT_PUBLIC_BASE_URL}/v/${encodeURIComponent(cert.passport_vin)}`
      : `${CERT_PUBLIC_BASE_URL}/c/${cert.public_id}`;

    try {
      const isSupported = await NfcManager.isSupported();
      if (!isSupported) {
        throw new Error("このデバイスはNFCに対応していません");
      }

      await NfcManager.start();

      const isEnabled = await NfcManager.isEnabled();
      if (!isEnabled) {
        throw new Error("NFCが無効です。設定から有効にしてください");
      }

      // Request NFC technology
      await NfcManager.requestTechnology(NfcTech.Ndef);

      // Create NDEF URI record
      const bytes = Ndef.encodeMessage([Ndef.uriRecord(certUrl)]);
      if (!bytes) {
        throw new Error("NDEFメッセージの作成に失敗しました");
      }

      // Write to tag
      await NfcManager.ndefHandler.writeNdefMessage(bytes);

      // Read-back verify
      setWriteState("verifying");
      const tag = await NfcManager.getTag();
      if (!tag) {
        throw new Error("書込み後の読み戻しに失敗しました");
      }

      const ndefRecords = tag.ndefMessage;
      if (!ndefRecords || ndefRecords.length === 0) {
        throw new Error("書込み後のデータが見つかりません");
      }

      let readUrl = "";
      for (const record of ndefRecords) {
        if (record.tnf === Ndef.TNF_WELL_KNOWN) {
          const decoded = Ndef.uri.decodePayload(
            record.payload as unknown as Uint8Array
          );
          if (decoded) {
            readUrl = decoded;
            break;
          }
        }
      }

      if (readUrl !== certUrl) {
        throw new Error("書込みデータの検証に失敗しました");
      }

      // Permanently lock the tag (NDEF read-only).
      // 車両基準のVIN/public_id URLは不変で書き換える必要がないため
      // 改ざん防止のため常時ロックする。makeReadOnly() は不可逆。
      setWriteState("locking");
      try {
        await NfcManager.ndefHandler.makeReadOnly();
      } catch (lockErr) {
        const lockMsg =
          lockErr instanceof Error ? lockErr.message : String(lockErr);
        throw new Error(`ロックに失敗しました: ${lockMsg}`);
      }

      const tagUid = tag.id;

      // Record the write on the server
      try {
        // First create or find the tag record
        await mobileApi(`/nfc/${tagUid}/write`, {
          method: "POST",
          body: {
            certificate_id: cert.id,
            url: certUrl,
          },
        });

        // Then attach the tag
        await mobileApi(`/nfc/${tagUid}/attach`, {
          method: "POST",
          body: {
            certificate_id: cert.id,
          },
        });
      } catch {
        // Server recording failed but NFC write succeeded
        // We'll still show success since the physical write worked
      }

      setWriteState("success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "書込みに失敗しました";
      setErrorMessage(message);
      setWriteState("error");
    } finally {
      try {
        await NfcManager.cancelTechnologyRequest();
      } catch {
        // ignore cleanup errors
      }
    }
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!cert) {
    return (
      <View style={styles.center}>
        <Text>証明書が見つかりません</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Certificate Info */}
      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <Text variant="titleMedium" style={styles.certNo}>
            {cert.certificate_no}
          </Text>
          {cert.customer_name && (
            <Text variant="bodyMedium" style={styles.sub}>
              {cert.customer_name}
            </Text>
          )}
          <Text variant="bodySmall" style={styles.sub}>
            {[cert.vehicle_maker, cert.vehicle_model, cert.plate_display]
              .filter(Boolean)
              .join(" ")}
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.content}>
        {writeState === "idle" && (
          <>
            <Icon source="nfc" size={64} color="#1a1a2e" />
            <Text variant="bodyLarge" style={styles.instruction}>
              NFCタグをデバイスに近づけてください
            </Text>
            <Text variant="bodySmall" style={styles.lockNotice}>
              書込み後、タグは永続的にロックされます
            </Text>
            <Button
              mode="contained"
              onPress={() => setConfirmVisible(true)}
              buttonColor="#1a1a2e"
              icon="lock"
              style={styles.writeButton}
              contentStyle={styles.writeButtonContent}
            >
              書込み開始
            </Button>
          </>
        )}

        {writeState === "writing" && (
          <>
            <ActivityIndicator size="large" color="#1a1a2e" />
            <Text variant="titleMedium" style={styles.statusText}>
              書込み中...
            </Text>
            <Text variant="bodyMedium" style={styles.instruction}>
              タグを離さないでください
            </Text>
          </>
        )}

        {writeState === "verifying" && (
          <>
            <ActivityIndicator size="large" color="#1a1a2e" />
            <Text variant="titleMedium" style={styles.statusText}>
              検証中...
            </Text>
          </>
        )}

        {writeState === "locking" && (
          <>
            <ActivityIndicator size="large" color="#1a1a2e" />
            <Text variant="titleMedium" style={styles.statusText}>
              ロック中...
            </Text>
            <Text variant="bodyMedium" style={styles.instruction}>
              タグを離さないでください
            </Text>
          </>
        )}

        {writeState === "success" && (
          <>
            <Icon source="lock-check" size={64} color="#166534" />
            <Text variant="titleMedium" style={styles.successText}>
              書込み・ロック完了
            </Text>
            <Text variant="bodyMedium" style={styles.instruction}>
              NFCタグへの書込みとロックが正常に完了しました
            </Text>
            <Button
              mode="contained"
              onPress={() => setWriteState("idle")}
              buttonColor="#1a1a2e"
              style={styles.writeButton}
            >
              別のタグに書込む
            </Button>
          </>
        )}

        {writeState === "error" && (
          <>
            <Icon source="alert-circle" size={64} color="#991b1b" />
            <Text variant="bodyLarge" style={styles.errorText}>
              {errorMessage}
            </Text>
            <Button
              mode="contained"
              onPress={startWrite}
              buttonColor="#1a1a2e"
              style={styles.writeButton}
            >
              再試行
            </Button>
          </>
        )}
      </View>

      <Portal>
        <Dialog
          visible={confirmVisible}
          onDismiss={() => setConfirmVisible(false)}
        >
          <Dialog.Icon icon="lock-alert" color="#991b1b" />
          <Dialog.Title style={styles.dialogTitle}>
            タグを永続ロックします
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              このNFCタグに証明書URLを書込み、書換え不可の状態にロックします。
              この操作は取り消せません。
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmVisible(false)}>キャンセル</Button>
            <Button
              mode="contained"
              buttonColor="#1a1a2e"
              onPress={() => {
                setConfirmVisible(false);
                startWrite();
              }}
            >
              書込み実行
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { margin: 12, backgroundColor: "#ffffff" },
  certNo: { fontWeight: "700", color: "#1a1a2e" },
  sub: { color: "#71717a", marginTop: 4 },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  instruction: {
    color: "#71717a",
    textAlign: "center",
    marginTop: 16,
  },
  lockNotice: {
    color: "#991b1b",
    textAlign: "center",
    marginTop: 8,
    fontWeight: "600",
  },
  dialogTitle: {
    textAlign: "center",
    fontWeight: "700",
  },
  writeButton: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  writeButtonContent: {
    paddingVertical: 8,
  },
  statusText: {
    color: "#1a1a2e",
    marginTop: 16,
    fontWeight: "600",
  },
  successText: {
    color: "#166534",
    marginTop: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#991b1b",
    textAlign: "center",
    marginTop: 16,
  },
});
