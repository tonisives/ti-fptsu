module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer ApplicativePar over ApplyPar",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      noApplyPar: "Use 'ApplicativePar' instead of 'ApplyPar'.",
    },
    fixable: "code",
    schema: [],
  },

  create(context) {
    return {
      MemberExpression(node) {
        let property = node.property
        if (
          property &&
          property.type === "Identifier" &&
          property.name === "ApplyPar"
        ) {
          context.report({
            node: property,
            messageId: "noApplyPar",
            fix(fixer) {
              return fixer.replaceText(property, "ApplicativePar")
            },
          })
        }
      },

      Identifier(node) {
        if (node.name !== "ApplyPar") return

        const parent = node.parent
        if (parent && parent.type === "MemberExpression") return

        if (
          parent &&
          parent.type === "ImportSpecifier" &&
          parent.imported === node
        ) {
          context.report({
            node: node,
            messageId: "noApplyPar",
            fix(fixer) {
              return fixer.replaceText(node, "ApplicativePar")
            },
          })
        }
      },
    }
  },
}
