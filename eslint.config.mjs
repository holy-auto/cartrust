import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Downgrade to warnings — too many legacy usages to fix at once before launch
      "@typescript-eslint/no-explicit-any": "warn",
      "prefer-const": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      // React Compiler / react-hooks rules — warn until existing code is refactored
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/set-state-in-render": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/use-memo": "warn",
      "react-hooks/globals": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/error-boundaries": "warn",
      "react-hooks/config": "warn",
      "react-hooks/gating": "warn",
      "react-hooks/component-hook-factories": "warn",
    },
  },
  // Stricter rules for lib files — no new `any` without explicit eslint-disable comment
  {
    files: ["src/lib/**/*.ts", "src/lib/**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      // Disallow @ts-ignore in favour of @ts-expect-error (requires explanation)
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-ignore": "allow-with-description",
          "ts-expect-error": "allow-with-description",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
