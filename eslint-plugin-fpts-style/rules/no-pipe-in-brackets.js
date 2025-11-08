module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow pipe/flow returns inside brackets. Functions should return a single pipe/flow expression without wrapping in curly braces.",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      pipeInBrackets:
        "Return pipe/flow as a single expression without brackets. Construct dependencies object with sequenceS(ApplicativePar/Seq) or piped flatMaps.",
    },
    schema: [],
  },

  create(context) {
    let hasFptsImport = false

    function isPipeOrFlowCall(node) {
      if (!node || node.type !== "CallExpression") return false

      // Direct call: pipe(...) or flow(...)
      if (node.callee.type === "Identifier") {
        return node.callee.name === "pipe" || node.callee.name === "flow"
      }

      // Flow with immediate invocation: flow(...)(arg)
      if (node.callee.type === "CallExpression" && node.callee.callee.type === "Identifier") {
        return node.callee.callee.name === "flow"
      }

      return false
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

      ArrowFunctionExpression(node) {
        if (!hasFptsImport) return

        // Only check if the function body is a BlockStatement (has curly braces)
        if (node.body.type !== "BlockStatement") return

        // Check if there's a return statement returning pipe/flow
        const statements = node.body.body
        if (statements.length === 0) return

        // Find return statements
        const returnStatements = statements.filter((stmt) => stmt.type === "ReturnStatement")

        for (const returnStmt of returnStatements) {
          if (returnStmt.argument && isPipeOrFlowCall(returnStmt.argument)) {
            context.report({
              node: node,
              messageId: "pipeInBrackets",
            })
            break
          }
        }
      },

      FunctionExpression(node) {
        if (!hasFptsImport) return
        if (node.body.type !== "BlockStatement") return

        const statements = node.body.body
        if (statements.length === 0) return

        const returnStatements = statements.filter((stmt) => stmt.type === "ReturnStatement")

        for (const returnStmt of returnStatements) {
          if (returnStmt.argument && isPipeOrFlowCall(returnStmt.argument)) {
            context.report({
              node: node,
              messageId: "pipeInBrackets",
            })
            break
          }
        }
      },

      FunctionDeclaration(node) {
        if (!hasFptsImport) return
        if (node.body.type !== "BlockStatement") return

        const statements = node.body.body
        if (statements.length === 0) return

        const returnStatements = statements.filter((stmt) => stmt.type === "ReturnStatement")

        for (const returnStmt of returnStatements) {
          if (returnStmt.argument && isPipeOrFlowCall(returnStmt.argument)) {
            context.report({
              node: node,
              messageId: "pipeInBrackets",
            })
            break
          }
        }
      },
    }
  },
}
