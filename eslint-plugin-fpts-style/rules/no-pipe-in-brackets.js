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

      // Immediate invocation: pipe(...)(args) or flow(...)(args)
      if (node.callee.type === "CallExpression" && node.callee.callee.type === "Identifier") {
        return node.callee.callee.name === "pipe" || node.callee.callee.name === "flow"
      }

      return false
    }

    function containsPipeOrFlow(node) {
      if (!node) return false

      // Direct pipe/flow call
      if (isPipeOrFlowCall(node)) return true

      // Check ConditionalExpression (ternary)
      if (node.type === "ConditionalExpression") {
        return containsPipeOrFlow(node.consequent) || containsPipeOrFlow(node.alternate)
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

        // Check BlockStatement (curly braces) - existing behavior
        if (node.body.type === "BlockStatement") {
          const statements = node.body.body
          if (statements.length === 0) return

          // Find all return statements that return pipe/flow or ternaries containing pipe/flow
          const returnStatements = statements.filter((stmt) => stmt.type === "ReturnStatement")

          for (const returnStmt of returnStatements) {
            if (returnStmt.argument && (isPipeOrFlowCall(returnStmt.argument) || containsPipeOrFlow(returnStmt.argument))) {
              context.report({
                node: node,
                messageId: "pipeInBrackets",
              })
              break
            }
          }
        } else {
          // Check expression body for ternaries containing pipe/flow
          // Only flag if it's a ternary (ConditionalExpression), not a direct pipe/flow call
          if (node.body.type === "ConditionalExpression" && containsPipeOrFlow(node.body)) {
            context.report({
              node: node,
              messageId: "pipeInBrackets",
            })
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
          if (returnStmt.argument && (isPipeOrFlowCall(returnStmt.argument) || containsPipeOrFlow(returnStmt.argument))) {
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
          if (returnStmt.argument && (isPipeOrFlowCall(returnStmt.argument) || containsPipeOrFlow(returnStmt.argument))) {
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
