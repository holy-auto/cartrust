import { beforeEach, describe, expect, it } from "vitest";
import type { Reader } from "@stripe/stripe-terminal-react-native";

import { useTerminalStore } from "../terminalStore";

// 各テスト前に store を初期状態へ戻すヘルパー
function resetStore() {
  useTerminalStore.setState({
    readerStatus: "disconnected",
    connectedReader: null,
    discoveredReaders: [],
    readerError: null,
    paymentStatus: "idle",
    paymentError: null,
    lastReceiptData: null,
  });
}

const mockReader = {
  serialNumber: "RDR-001",
  deviceType: "stripe_m2",
} as unknown as Reader.Type;

describe("useTerminalStore", () => {
  beforeEach(resetStore);

  it("initial state は idle / disconnected", () => {
    const s = useTerminalStore.getState();
    expect(s.readerStatus).toBe("disconnected");
    expect(s.paymentStatus).toBe("idle");
    expect(s.connectedReader).toBeNull();
    expect(s.discoveredReaders).toEqual([]);
    expect(s.readerError).toBeNull();
    expect(s.paymentError).toBeNull();
  });

  it("setReaderStatus は readerStatus を更新する", () => {
    useTerminalStore.getState().setReaderStatus("discovering");
    expect(useTerminalStore.getState().readerStatus).toBe("discovering");

    useTerminalStore.getState().setReaderStatus("connected");
    expect(useTerminalStore.getState().readerStatus).toBe("connected");
  });

  it("setConnectedReader は reader 情報を保持する", () => {
    useTerminalStore.getState().setConnectedReader(mockReader);
    expect(useTerminalStore.getState().connectedReader).toBe(mockReader);

    useTerminalStore.getState().setConnectedReader(null);
    expect(useTerminalStore.getState().connectedReader).toBeNull();
  });

  it("setDiscoveredReaders は配列を置換する", () => {
    useTerminalStore.getState().setDiscoveredReaders([mockReader, mockReader]);
    expect(useTerminalStore.getState().discoveredReaders).toHaveLength(2);

    useTerminalStore.getState().setDiscoveredReaders([]);
    expect(useTerminalStore.getState().discoveredReaders).toEqual([]);
  });

  it("setReaderError と setPaymentError はエラー文字列を保持する", () => {
    useTerminalStore.getState().setReaderError("接続失敗");
    expect(useTerminalStore.getState().readerError).toBe("接続失敗");

    useTerminalStore.getState().setPaymentError("カード読み取り失敗");
    expect(useTerminalStore.getState().paymentError).toBe(
      "カード読み取り失敗"
    );
  });

  it("setPaymentStatus はステータス遷移を反映する", () => {
    const transitions = [
      "creating",
      "collecting",
      "processing",
      "capturing",
      "succeeded",
    ] as const;
    for (const next of transitions) {
      useTerminalStore.getState().setPaymentStatus(next);
      expect(useTerminalStore.getState().paymentStatus).toBe(next);
    }
  });

  it("setLastReceiptData は領収書データを保持する", () => {
    const receipt = { payment_intent_id: "pi_123", amount: 5000 };
    useTerminalStore.getState().setLastReceiptData(receipt);
    expect(useTerminalStore.getState().lastReceiptData).toEqual(receipt);
  });

  it("resetPayment は payment 系のみリセット (reader系は保持)", () => {
    const s = useTerminalStore.getState();
    s.setReaderStatus("connected");
    s.setConnectedReader(mockReader);
    s.setReaderError("warning");
    s.setPaymentStatus("succeeded");
    s.setPaymentError("temporary");
    s.setLastReceiptData({ id: "pi_1" });

    s.resetPayment();

    const after = useTerminalStore.getState();
    // payment 系: 初期化される
    expect(after.paymentStatus).toBe("idle");
    expect(after.paymentError).toBeNull();
    expect(after.lastReceiptData).toBeNull();
    // reader 系: 保持される
    expect(after.readerStatus).toBe("connected");
    expect(after.connectedReader).toBe(mockReader);
    expect(after.readerError).toBe("warning");
  });
});
