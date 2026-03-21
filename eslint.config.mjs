import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Spread nextTs and override react-compiler rule in the same config objects
  ...nextTs.map((config) => {
    if (config?.rules?.["react-compiler/react-compiler"]) {
      return {
        ...config,
        rules: {
          ...config.rules,
          "react-compiler/react-compiler": "warn",
        },
      };
    }
    return config;
  }),
  {
    rules: {
      // Downgrade to warnings — too many legacy usages to fix at once before launch
      "@typescript-eslint/no-explicit-any": "warn",
      "prefer-const": "warn",
      "@typescript-eslint/no-require-imports": "warn",
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
