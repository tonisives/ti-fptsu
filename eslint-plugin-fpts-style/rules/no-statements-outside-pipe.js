module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow statements outside pipe expressions in functions that should return a single pipe expression",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      statementOutsidePipe:
        "Function call outside pipe expression. Prefer functions that return a single pipe expression without brackets.",
      multipleStatements:
        "Function should return a single pipe expression. Move statements into the pipe or extract to separate functions.",
      unnecessaryPipe:
        "Unnecessary pipe with single expression. Return the expression directly without pipe wrapper.",
    },
    schema: [],
  },

  create(context) {
    let hasFptsImport = false

    let checkForUnnecessaryPipe = (node) => {
      if (
        node.type === "CallExpression" &&
        node.callee.type === "Identifier" &&
        node.callee.name === "pipe" &&
        node.arguments.length === 1
      ) {
        context.report({
          node: node,
          messageId: "unnecessaryPipe",
        })
      }
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

      VariableDeclarator(node) {
        if (!hasFptsImport) return

        if (
          node.init &&
          node.init.type === "ArrowFunctionExpression" &&
          node.init.body.type === "BlockStatement"
        ) {
          let statements = node.init.body.body
          if (statements.length === 0) return

          let returnStatement = statements.find((stmt) => stmt.type === "ReturnStatement")
          if (!returnStatement) return

          let isPipeOrFlowReturn = false
          if (
            returnStatement.argument &&
            returnStatement.argument.type === "CallExpression" &&
            returnStatement.argument.callee.type === "Identifier" &&
            (returnStatement.argument.callee.name === "pipe" || returnStatement.argument.callee.name === "flow")
          ) {
            isPipeOrFlowReturn = true
            checkForUnnecessaryPipe(returnStatement.argument)
          }

          if (!isPipeOrFlowReturn) return

          let hasNonReturnStatements = statements.some((stmt) => stmt.type !== "ReturnStatement")

          if (hasNonReturnStatements) {
            statements.forEach((stmt) => {
              if (stmt.type === "ExpressionStatement" && stmt.expression.type === "CallExpression") {
                context.report({
                  node: stmt,
                  messageId: "statementOutsidePipe",
                })
              }
            })

            if (statements.length > 1) {
              context.report({
                node: node.init,
                messageId: "multipleStatements",
              })
            }
          }
        }

        if (node.init && node.init.type === "ArrowFunctionExpression") {
          let body = node.init.body

          if (body.type === "CallExpression") {
            checkForUnnecessaryPipe(body)
          }

          if (body.type === "ArrowFunctionExpression") {
            if (body.body.type === "CallExpression") {
              checkForUnnecessaryPipe(body.body)
            }

            if (body.body.type === "ArrowFunctionExpression" && body.body.body.type === "CallExpression") {
              checkForUnnecessaryPipe(body.body.body)
            }

            if (body.body.type === "BlockStatement") {
              let statements = body.body.body
              if (statements.length === 0) return

              let hasNonReturnStatements = statements.some((stmt) => stmt.type !== "ReturnStatement")

              if (hasNonReturnStatements) {
                statements.forEach((stmt) => {
                  if (
                    stmt.type === "ExpressionStatement" &&
                    stmt.expression.type === "CallExpression"
                  ) {
                    context.report({
                      node: stmt,
                      messageId: "statementOutsidePipe",
                    })
                  }
                })
              }
            }
          }
        }
      },
    }
  },
}
