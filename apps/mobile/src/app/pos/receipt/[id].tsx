import { View, StyleSheet, ScrollView, Share, Alert } from "react-native";
import {
  Text,
  Card,
  Button,
  Divider,
  ActivityIndicator,
  IconButton,
} from "react-native-paper";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

interface Payment {
  id: string;
  amount: number;
  payment_method: string;
  paid_at: string;
  received_amount: number | null;
  change_amount: number | null;
  reservation: {
    id: string;
    customer: { name: string; phone: string | null } | null;
    vehicle: { plate_number: string; make: string | null; model: string | null } | null;
    reservation_items: {
      id: string;
      quantity: number;
      unit_price: number;
      menu_item: { name: string } | null;
    }[];
  } | null;
}

interface StoreDetail {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
}

const METHOD_LABELS: Record<string, string> = {
  cash: "現金",
  card: "カード",
  qr: "QR決済",
  bank_transfer: "振込",
};

// 日本の標準消費税率。軽減税率対象が無い前提で内税扱い。
const TAX_RATE = 0.1;

function formatReceiptNo(paymentId: string, paidAt: Date) {
  const ymd = `${paidAt.getFullYear()}${String(paidAt.getMonth() + 1).padStart(2, "0")}${String(paidAt.getDate()).padStart(2, "0")}`;
  // 領収書番号は人の目で読みやすい [日付-PaymentIdの先頭8字] 形式
  return `R-${ymd}-${paymentId.slice(0, 8).toUpperCase()}`;
}

export default function PosReceiptScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, selectedStore } = useAuthStore();

  const { data: payment, isLoading } = useQuery<Payment>({
    queryKey: ["payment-receipt", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select(
          `
          id, amount, payment_method, paid_at, received_amount, change_amount,
          reservation:reservations(
            id,
            customer:customers(name, phone),
            vehicle:vehicles(plate_number, make, model),
            reservation_items(
              id, quantity, unit_price,
              menu_item:menu_items(name)
            )
          )
        `
        )
        .eq("reservation_id", id)
        .order("paid_at", { ascending: false })
        .limit(1)
        .single();
      if (error) throw error;
      return data as unknown as Payment;
    },
    enabled: !!id,
  });

  // 店舗詳細（住所・電話などレシートに必要な情報）
  const { data: store } = useQuery<StoreDetail | null>({
    queryKey: ["store-receipt", selectedStore?.id],
    queryFn: async () => {
      if (!selectedStore?.id || !user?.tenantId) return null;
      const { data, error } = await supabase
        .from("stores")
        .select("id, name, address, phone, email")
        .eq("id", selectedStore.id)
        .eq("tenant_id", user.tenantId)
        .single();
      if (error) throw error;
      return data as StoreDetail;
    },
    enabled: !!selectedStore?.id && !!user?.tenantId,
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!payment) {
    return (
      <View style={styles.center}>
        <Text>レシートが見つかりません</Text>
      </View>
    );
  }

  const paidDate = new Date(payment.paid_at);
  const receiptNo = formatReceiptNo(payment.id, paidDate);

  // 内税方式: 表示価格に税が含まれている前提
  const taxIncluded = payment.amount;
  const taxAmount = Math.round(taxIncluded - taxIncluded / (1 + TAX_RATE));
  const subtotal = taxIncluded - taxAmount;

  async function handleShare() {
    if (!payment) return;

    const lines: string[] = [];
    if (store?.name) lines.push(store.name);
    if (store?.address) lines.push(store.address);
    if (store?.phone) lines.push(`TEL: ${store.phone}`);
    lines.push("");
    lines.push(`領収書番号: ${receiptNo}`);
    lines.push(
      `${paidDate.toLocaleDateString("ja-JP")} ${paidDate.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}`
    );
    lines.push("");

    if (payment.reservation?.customer?.name) {
      lines.push(`お客様: ${payment.reservation.customer.name}`);
    }
    if (payment.reservation?.vehicle?.plate_number) {
      lines.push(`車両: ${payment.reservation.vehicle.plate_number}`);
    }
    lines.push("");
    lines.push("[ 明細 ]");
    for (const item of payment.reservation?.reservation_items ?? []) {
      const name = item.menu_item?.name ?? "不明";
      const total = item.quantity * item.unit_price;
      lines.push(`  ${name} x${item.quantity}  ¥${total.toLocaleString()}`);
    }
    lines.push("");
    lines.push(`小計  ¥${subtotal.toLocaleString()}`);
    lines.push(`消費税(${Math.round(TAX_RATE * 100)}%)  ¥${taxAmount.toLocaleString()}`);
    lines.push(`合計  ¥${taxIncluded.toLocaleString()}`);
    lines.push(`支払方法: ${METHOD_LABELS[payment.payment_method] ?? payment.payment_method}`);

    try {
      await Share.share({ message: lines.join("\n") });
    } catch (e) {
      Alert.alert(
        "共有に失敗しました",
        e instanceof Error ? e.message : String(e)
      );
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "レシート",
          headerRight: () => (
            <IconButton
              icon="share-variant"
              onPress={handleShare}
              accessibilityLabel="共有"
            />
          ),
        }}
      />
      <ScrollView style={styles.container}>
        {/* Store Header — 顧客に見せる体裁 */}
        {store && (
          <Card style={styles.card} mode="outlined">
            <Card.Content style={styles.storeHeader}>
              <Text variant="titleLarge" style={styles.storeName}>
                {store.name}
              </Text>
              {store.address && (
                <Text variant="bodySmall" style={styles.subText}>
                  {store.address}
                </Text>
              )}
              {store.phone && (
                <Text variant="bodySmall" style={styles.subText}>
                  TEL: {store.phone}
                </Text>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Header */}
        <Card style={styles.card} mode="outlined">
          <Card.Content style={styles.receiptHeader}>
            <Text variant="headlineSmall" style={styles.checkmark}>
              {"✓"}
            </Text>
            <Text variant="titleLarge" style={styles.paidText}>
              お支払い完了
            </Text>
            <Text variant="headlineMedium" style={styles.amount}>
              {"¥"}
              {payment.amount.toLocaleString()}
            </Text>
            <Text variant="bodyMedium" style={styles.subText}>
              {METHOD_LABELS[payment.payment_method] ?? payment.payment_method}
            </Text>
            <Text variant="bodySmall" style={styles.receiptNo}>
              領収書 №{receiptNo}
            </Text>
            <Text variant="bodySmall" style={styles.subText}>
              {paidDate.toLocaleDateString("ja-JP")}{" "}
              {paidDate.toLocaleTimeString("ja-JP", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </Card.Content>
        </Card>

        {/* Customer & Vehicle */}
        {payment.reservation && (
          <Card style={styles.card} mode="outlined">
            <Card.Content>
              <Text variant="titleMedium" style={styles.heading}>
                顧客 / 車両
              </Text>
              <Text variant="bodyLarge" style={{ fontWeight: "600" }}>
                {payment.reservation.customer?.name ?? "不明"} 様
              </Text>
              {payment.reservation.customer?.phone && (
                <Text variant="bodySmall" style={styles.subText}>
                  {payment.reservation.customer.phone}
                </Text>
              )}
              <Text variant="bodyMedium" style={{ marginTop: 4 }}>
                {payment.reservation.vehicle?.plate_number ?? ""}{" "}
                {[
                  payment.reservation.vehicle?.make,
                  payment.reservation.vehicle?.model,
                ]
                  .filter(Boolean)
                  .join(" ")}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Line Items + Tax breakdown */}
        {payment.reservation && (
          <Card style={styles.card} mode="outlined">
            <Card.Content>
              <Text variant="titleMedium" style={styles.heading}>
                明細
              </Text>
              {payment.reservation.reservation_items.map((item) => (
                <View key={item.id} style={styles.lineItem}>
                  <Text variant="bodyMedium" style={{ flex: 1 }}>
                    {item.menu_item?.name ?? "不明"}
                  </Text>
                  <Text variant="bodyMedium" style={styles.subText}>
                    x{item.quantity}
                  </Text>
                  <Text variant="bodyMedium" style={styles.price}>
                    {"¥"}
                    {(item.quantity * item.unit_price).toLocaleString()}
                  </Text>
                </View>
              ))}
              <Divider style={{ marginVertical: 8 }} />

              {/* 税内訳 */}
              <View style={styles.lineItem}>
                <Text variant="bodyMedium" style={{ flex: 1 }}>
                  小計（税抜）
                </Text>
                <Text variant="bodyMedium">
                  {"¥"}
                  {subtotal.toLocaleString()}
                </Text>
              </View>
              <View style={styles.lineItem}>
                <Text variant="bodyMedium" style={{ flex: 1 }}>
                  消費税 ({Math.round(TAX_RATE * 100)}%)
                </Text>
                <Text variant="bodyMedium">
                  {"¥"}
                  {taxAmount.toLocaleString()}
                </Text>
              </View>
              <Divider style={{ marginVertical: 8 }} />
              <View style={styles.lineItem}>
                <Text
                  variant="titleSmall"
                  style={{ flex: 1, fontWeight: "700" }}
                >
                  合計（税込）
                </Text>
                <Text variant="titleSmall" style={{ fontWeight: "700" }}>
                  {"¥"}
                  {taxIncluded.toLocaleString()}
                </Text>
              </View>

              {payment.payment_method === "cash" && (
                <>
                  <Divider style={{ marginVertical: 8 }} />
                  <View style={styles.lineItem}>
                    <Text variant="bodyMedium" style={{ flex: 1 }}>
                      お預かり
                    </Text>
                    <Text variant="bodyMedium">
                      {"¥"}
                      {(payment.received_amount ?? 0).toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.lineItem}>
                    <Text variant="bodyMedium" style={{ flex: 1 }}>
                      おつり
                    </Text>
                    <Text variant="bodyMedium">
                      {"¥"}
                      {(payment.change_amount ?? 0).toLocaleString()}
                    </Text>
                  </View>
                </>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            icon="share-variant"
            onPress={handleShare}
            style={styles.actionButton}
            buttonColor="#1a1a2e"
          >
            レシートを共有
          </Button>
          <Button
            mode="contained"
            icon="certificate"
            onPress={() =>
              router.push(`/certificates/new?reservationId=${id}`)
            }
            style={styles.actionButton}
            buttonColor="#1a1a2e"
          >
            証明書を作成
          </Button>
          <Button
            mode="outlined"
            icon="home"
            onPress={() => router.replace("/(tabs)")}
            style={styles.actionButton}
          >
            ホームに戻る
          </Button>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#ffffff",
  },
  storeHeader: {
    alignItems: "center",
    paddingVertical: 12,
  },
  storeName: {
    fontWeight: "700",
    color: "#1a1a2e",
  },
  receiptHeader: {
    alignItems: "center",
    paddingVertical: 24,
  },
  checkmark: {
    fontSize: 48,
    color: "#10b981",
  },
  paidText: {
    fontWeight: "700",
    color: "#1a1a2e",
    marginTop: 8,
  },
  amount: {
    fontWeight: "700",
    color: "#1a1a2e",
    marginTop: 4,
  },
  receiptNo: {
    color: "#3f3f46",
    marginTop: 8,
    fontFamily: "monospace",
  },
  heading: { fontWeight: "700", color: "#1a1a2e", marginBottom: 8 },
  subText: { color: "#71717a", marginTop: 2 },
  price: { fontWeight: "600", color: "#1a1a2e", marginLeft: 12 },
  lineItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  actions: { padding: 16, gap: 12 },
  actionButton: { borderRadius: 8 },
});
