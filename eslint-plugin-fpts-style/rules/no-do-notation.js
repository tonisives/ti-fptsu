module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow Do notation (Do, apS, bind, etc.). Use sequenceS/sequenceT instead.",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      noDoNotation:
        "Do not use Do notation ({{method}}). Use sequenceS/sequenceT instead for cleaner code that runs in parallel.",
    },
    schema: [],
  },

  create(context) {
    let doNotationMethods = new Set([
      "Do",
      "apS",
      "apSW",
      "bind",
      "bindW",
      "bindTo",
      "let",
    ])

    let fptsModules = new Set([
      "te",
      "t",
      "io",
      "e",
      "o",
      "a",
      "rte",
      "rt",
      "r",
      "s",
      "st",
    ])

    return {
      MemberExpression(node) {
        if (
          node.object.type === "Identifier" &&
          fptsModules.has(node.object.name) &&
          node.property.type === "Identifier" &&
          doNotationMethods.has(node.property.name)
        ) {
          context.report({
            node,
            messageId: "noDoNotation",
            data: {
              method: `${node.object.name}.${node.property.name}`,
            },
          })
        }
      },
    }
  },
}
