module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Simplify Task constructors using t.of and t.fromIO instead of manual Promise wrapping",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      useTaskOf:
        "Use 't.of(...)' instead of '() => Promise.resolve(...)' for simple Task constructors",
      useTaskFromIO:
        "Use 't.fromIO(() => { ... })' instead of '() => Promise.resolve().then(() => { ... })' for Task constructors with side effects",
    },
    fixable: "code",
    schema: [],
  },

  create(context) {
    let hasFptsImport = false
    let taskNamespaces = new Set()
    let sourceCode = context.getSourceCode()

    return {
      ImportDeclaration(node) {
        if (
          node.source.value === "ti-fptsu/lib" ||
          node.source.value.startsWith("fp-ts/") ||
          node.source.value === "fp-ts"
        ) {
          hasFptsImport = true

          node.specifiers.forEach((spec) => {
            if (spec.type === "ImportSpecifier") {
              taskNamespaces.add(spec.local.name)
            }
          })
        }
      },

      ArrowFunctionExpression(node) {
        if (!hasFptsImport) return

        // Check if it's a simple arrow function that returns another arrow function
        // Pattern: () => () => Promise.resolve(...)
        if (
          node.body.type === "ArrowFunctionExpression" &&
          node.params.length === 0
        ) {
          let innerArrow = node.body

          // Check for: () => Promise.resolve(something)
          if (
            innerArrow.body.type === "CallExpression" &&
            innerArrow.params.length === 0
          ) {
            let callExpr = innerArrow.body

            // Pattern 1: () => Promise.resolve(value)
            if (
              callExpr.callee.type === "MemberExpression" &&
              callExpr.callee.object.type === "Identifier" &&
              callExpr.callee.object.name === "Promise" &&
              callExpr.callee.property.type === "Identifier" &&
              callExpr.callee.property.name === "resolve"
            ) {
              // Check if it's .then() chained
              let parent = node.parent
              let isChained = false

              // Look for Promise.resolve().then(...)
              if (callExpr.arguments.length === 0) {
                // This is Promise.resolve() without arguments
                // Check if there's a .then() in the parent context
                if (
                  parent &&
                  parent.type === "MemberExpression" &&
                  parent.property.name === "then"
                ) {
                  isChained = true
                }
              }

              if (!isChained && callExpr.arguments.length > 0) {
                // Pattern: () => () => Promise.resolve(value)
                let value = callExpr.arguments[0]
                let valueText = sourceCode.getText(value)

                // Get the outer function parameters
                let paramsText = sourceCode.getText(node).split("=>")[0].trim()

                context.report({
                  node: node,
                  messageId: "useTaskOf",
                  fix(fixer) {
                    return fixer.replaceText(node, `${paramsText} => t.of(${valueText})`)
                  },
                })
              }
            }
          }
        }

        // Check for: (params) => () => Promise.resolve().then(() => { ... })
        if (node.body.type === "ArrowFunctionExpression") {
          let innerArrow = node.body

          if (
            innerArrow.body.type === "CallExpression" &&
            innerArrow.params.length === 0
          ) {
            let callExpr = innerArrow.body

            // Check if it's a .then() call
            if (
              callExpr.callee.type === "MemberExpression" &&
              callExpr.callee.property.type === "Identifier" &&
              callExpr.callee.property.name === "then"
            ) {
              let object = callExpr.callee.object

              // Check if the object is Promise.resolve()
              if (
                object.type === "CallExpression" &&
                object.callee.type === "MemberExpression" &&
                object.callee.object.type === "Identifier" &&
                object.callee.object.name === "Promise" &&
                object.callee.property.type === "Identifier" &&
                object.callee.property.name === "resolve" &&
                object.arguments.length === 0
              ) {
                // Get the callback passed to .then()
                if (callExpr.arguments.length > 0) {
                  let thenCallback = callExpr.arguments[0]

                  if (thenCallback.type === "ArrowFunctionExpression") {
                    let callbackText = sourceCode.getText(thenCallback)

                    // Get the outer function parameters
                    let paramsText = sourceCode.getText(node).split("=>")[0].trim()

                    context.report({
                      node: node,
                      messageId: "useTaskFromIO",
                      fix(fixer) {
                        return fixer.replaceText(node, `${paramsText} => t.fromIO(${callbackText})`)
                      },
                    })
                  }
                }
              }
            }
          }
        }
      },
    }
  },
}
