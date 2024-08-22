const js = require("@eslint/js")

module.exports = [
  js.configs.recommended,

  {
    rules: {
      "no-unused-vars": "off",
      "no-undef": "off",
    },
  },
  {
    ignores: ["test/*", "lib/*"],
  },
]
