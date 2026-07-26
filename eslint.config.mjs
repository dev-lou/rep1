// ─── Snap IT PhotoBooth — ESLint Flat Config ─────────────────────────────
// Uses only built-in ESLint rules — no external plugins needed.
// TypeScript errors are caught by `tsc --noEmit` (not ESLint).

const eslintConfig = [
  {
    rules: {
      // Warn about unused variables (prefixed with _ are ignored)
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
];

export default eslintConfig;
