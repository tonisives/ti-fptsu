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
    },
    schema: [],
  },

  create(context) {
    let hasFptsImport = false

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

          if (body.type === "ArrowFunctionExpression" && body.body.type === "BlockStatement") {
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
      },
    }
  },
}
