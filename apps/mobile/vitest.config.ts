import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * モバイルアプリ用 vitest 設定。
 *
 * スコープ: 純粋なロジック層 (stores, lib/utils など) のみ。
 * React Native コンポーネントは jest-expo の方が相性が良いため、
 * 必要になったタイミングで別途 jest を導入する。
 *
 * include: src/**\/__tests__/**\/*.test.ts(x)
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/__tests__/**/*.test.{ts,tsx}", "src/**/*.test.{ts,tsx}"],
    globals: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
