module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer merging short pipe functions that are only called once",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      mergePipes:
        "Function '{{callee}}' ({{calleeCount}} operations) is only called by '{{caller}}' ({{callerCount}} operations). Combined total is {{total}} operations (<=10). Consider merging them into a single function.",
    },
    schema: [
      {
        type: "object",
        properties: {
          maxPipeLength: {
            type: "number",
            default: 4,
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    let hasFptsImport = false
    let functionInfo = new Map()
    let functionReferences = new Map()

    const maxPipeLength =
      context.options[0]?.maxPipeLength !== undefined ? context.options[0].maxPipeLength : 4

    function isPipeCall(node) {
      return (
        node.type === "CallExpression" &&
        node.callee.type === "Identifier" &&
        node.callee.name === "pipe"
      )
    }

    function countPipeArguments(node) {
      if (isPipeCall(node)) {
        return node.arguments.length
      }
      return null
    }

    function isExported(node) {
      let parent = node.parent
      while (parent) {
        if (
          parent.type === "ExportNamedDeclaration" ||
          parent.type === "ExportDefaultDeclaration"
        ) {
          return true
        }
        parent = parent.parent
      }
      return false
    }

    function getFunctionName(node) {
      if (node.type === "VariableDeclarator" && node.id.type === "Identifier") {
        return node.id.name
      }
      return null
    }

    function findPipeInFunction(node) {
      if (isPipeCall(node)) {
        return node
      }

      if (node.type === "ArrowFunctionExpression" && node.body) {
        if (isPipeCall(node.body)) {
          return node.body
        }
        if (node.body.type === "ArrowFunctionExpression") {
          return findPipeInFunction(node.body)
        }
      }

      return null
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

        const functionName = getFunctionName(node)
        if (!functionName) return

        if (node.init && node.init.type === "ArrowFunctionExpression" && !isExported(node)) {
          const pipeNode = findPipeInFunction(node.init)
          if (pipeNode) {
            const argCount = countPipeArguments(pipeNode)
            functionInfo.set(functionName, {
              node: node,
              pipeNode: pipeNode,
              argCount: argCount,
              isExported: false,
            })
          }
        }
      },

      "CallExpression Identifier"(node) {
        if (!hasFptsImport) return

        if (node.name === "pipe") return

        let parent = node.parent
        while (parent) {
          if (parent.type === "CallExpression" && isPipeCall(parent)) {
            if (!functionReferences.has(node.name)) {
              functionReferences.set(node.name, [])
            }
            functionReferences.get(node.name).push({
              node: node,
              pipeCall: parent,
            })
            break
          }
          parent = parent.parent
        }
      },

      "Program:exit"() {
        if (!hasFptsImport) return

        for (const [functionName, info] of functionInfo.entries()) {
          if (info.argCount >= maxPipeLength) continue

          const references = functionReferences.get(functionName) || []

          if (references.length !== 1) continue

          const reference = references[0]
          let callerNode = reference.node

          while (callerNode && callerNode.type !== "VariableDeclarator") {
            callerNode = callerNode.parent
          }

          if (!callerNode) continue

          const callerName = getFunctionName(callerNode)
          if (!callerName) continue

          const callerInfo = functionInfo.get(callerName)
          if (!callerInfo) continue

          const totalArgs = callerInfo.argCount + info.argCount
          if (totalArgs <= 10) {
            context.report({
              node: info.node,
              messageId: "mergePipes",
              data: {
                callee: functionName,
                caller: callerName,
                calleeCount: info.argCount,
                callerCount: callerInfo.argCount,
                total: totalArgs,
              },
            })
          }
        }
      },
    }
  },
}
