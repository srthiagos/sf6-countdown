module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "object-curly-spacing": ["error", "always"],
    "quotes": ["error", "double"],
    "indent": ["error", 2],
    "brace-style": ["error", "1tbs", { "allowSingleLine": true }],
    "block-spacing": ["error", "always"],
  },
};
