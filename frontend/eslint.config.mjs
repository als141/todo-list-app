// frontend/eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Additional TypeScript configuration
const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals", 
    "plugin:@typescript-eslint/recommended"
  ),
  {
    rules: {
      // Disable TypeScript no-unused-vars for specific cases
      "@typescript-eslint/no-unused-vars": ["error", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "ignoreRestSiblings": true
      }],
      // Allow explicit any in certain cases, but still warn
      "@typescript-eslint/no-explicit-any": "warn",
    }
  }
];

export default eslintConfig;