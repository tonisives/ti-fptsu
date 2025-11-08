module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow imports from fp-ts/lib and enforce using ti-fptsu/lib instead",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      noFpTsLibImport:
        "Do not import from 'fp-ts/lib'. Use 'ti-fptsu/lib' instead (e.g., import { pipe, e, te } from 'ti-fptsu/lib')",
    },
    schema: [],
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        const importSource = node.source.value

        // Check if importing from fp-ts/lib
        if (importSource.startsWith("fp-ts/lib/")) {
          context.report({
            node: node,
            messageId: "noFpTsLibImport",
          })
        }
      },
    }
  },
}
