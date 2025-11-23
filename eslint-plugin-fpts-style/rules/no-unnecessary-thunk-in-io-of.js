module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Disallow unnecessary arrow functions in io.of() - use io.of(x) instead of io.of(() => x)",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      unnecessaryThunk:
        "Unnecessary arrow function in io.of(). Use 'io.of({{value}})' instead of 'io.of(() => {{value}})'.",
      multiLineThunk:
        "For multi-line IO operations, use a direct arrow function '() => { ... }' instead of wrapping in io.of().",
    },
    fixable: "code",
    schema: [],
  },

  create(context) {
    let hasFptsImport = false
    let sourceCode = context.getSourceCode()

    function isIOOfCall(node) {
      return (
        node.type === "CallExpression" &&
        node.callee.type === "MemberExpression" &&
        node.callee.object.type === "Identifier" &&
        node.callee.object.name === "io" &&
        node.callee.property.type === "Identifier" &&
        node.callee.property.name === "of"
      )
    }

    return {
      ImportDeclaration(node) {
        if (
          node.source.value === "ti-fptsu/lib" ||
          node.source.value.startsWith("fp-ts/") ||
          node.source.value === "fp-ts"
        ) {
          hasFptsImport = true
        }
      },

      CallExpression(node) {
        if (!hasFptsImport) return

        if (!isIOOfCall(node)) return

        // Check if io.of has arguments
        if (node.arguments.length !== 1) return

        let arg = node.arguments[0]

        // Check if the argument is an arrow function
        if (arg.type !== "ArrowFunctionExpression") return

        // Check if arrow function has no parameters
        if (arg.params.length !== 0) return

        // Check the body of the arrow function
        if (arg.body.type === "BlockStatement") {
          // Multi-line case: () => { statements }
          // This is more complex - we could suggest converting to direct arrow function
          // But for now, we'll just flag it
          context.report({
            node: node,
            messageId: "multiLineThunk",
          })
        } else {
          // Single expression case: () => value
          // This should be simplified to io.of(value)
          let valueText = sourceCode.getText(arg.body)

          context.report({
            node: node,
            messageId: "unnecessaryThunk",
            data: {
              value: valueText,
            },
            fix(fixer) {
              return fixer.replaceText(node, `io.of(${valueText})`)
            },
          })
        }
      },
    }
  },
}
