// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ["expo", "plugin:prettier/recommended"],
  ignorePatterns: ["/dist/*"],
  plugins: ["prettier", "unused-imports"],
  rules: {
    "prettier/prettier": "error",
    "unused-imports/no-unused-imports": "error",
  },
  env: {
    browser: true,
    node: true,
  },
};
