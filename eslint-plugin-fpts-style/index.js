module.exports = {
  rules: {
    "no-statements-outside-pipe": require("./rules/no-statements-outside-pipe"),
    "prefer-flatmap-over-chain": require("./rules/prefer-flatmap-over-chain"),
    "no-nested-pipes": require("./rules/no-nested-pipes"),
    "no-const-variables": require("./rules/no-const-variables"),
    "no-async-await": require("./rules/no-async-await"),
    "prefer-a-map": require("./rules/prefer-a-map"),
    "no-long-inline-functions-in-pipe": require("./rules/no-long-inline-functions-in-pipe"),
    "enforce-file-layout": require("./rules/enforce-file-layout"),
    "no-pipe-in-brackets": require("./rules/no-pipe-in-brackets"),
  },
}
