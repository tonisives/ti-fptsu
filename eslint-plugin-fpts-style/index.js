module.exports = {
  rules: {
    "no-statements-outside-pipe": require("./rules/no-statements-outside-pipe"),
    "prefer-flatmap-over-chain": require("./rules/prefer-flatmap-over-chain"),
    "no-nested-pipes": require("./rules/no-nested-pipes"),
    "no-const-variables": require("./rules/no-const-variables"),
    "no-async-await": require("./rules/no-async-await"),
    "prefer-a-map": require("./rules/prefer-a-map"),
  },
}
