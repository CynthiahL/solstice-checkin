import js from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

export default [
  // 1. Ignore build artifacts globally
  {
    ignores: ["**/dist/**", "**/node_modules/**", "backend/tests/**"]
  },
  
  // 2. Global Base JavaScript Rules
  js.configs.recommended,
  
  // 3. Backend Workspace Rules (Node.js Environment)
  {
    files: ["backend/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        process: "readonly"
      }
    },
    rules: {
      "no-console": "off", // Essential for tracing background print jobs
      "no-unused-vars": ["error", { "argsIgnorePattern": "^next" }] // Protects Express route signatures
    }
  },

  // 4. Frontend Workspace Rules (Browser + React Environment)
  {
    files: ["frontend/**/*.{js,jsx,ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true }
      }
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "react/prop-types": "off", // Disabled for clean modern JSX state flows
      "react/react-in-jsx-scope": "off" // Disabled for modern React 17+ / Vite configurations
    }
  },

  // 5. Global Settings Overrides to Bypass ESLint v10 Auto-Detect Failures
  {
    settings: {
      react: {
        version: "19.0" // Explicit configuration freezes and fixes the legacy getFilename() engine crash
      }
    }
  },

  // 6. Apply Prettier compatibility formatting rules
  eslintConfigPrettier
];
