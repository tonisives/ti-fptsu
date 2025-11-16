module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Warn about curried functions that are never partially applied",
      category: "Best Practices",
      recommended: false,
    },
    messages: {
      unnecessaryCurrying:
        "This curried function '{{ name }}' is never partially applied. Consider using regular parameters instead: ({{ params }}) => ...",
    },
    schema: [],
  },

  create(context) {
    let sourceCode = context.getSourceCode()
    let curriedFunctions = new Map()
    let allFunctionCalls = new Map()

    function countCurryLevels(node) {
      let count = 0
      let current = node

      while (current && current.type === "ArrowFunctionExpression") {
        count++
        if (current.body.type === "ArrowFunctionExpression") {
          current = current.body
        } else {
          break
        }
      }

      return count
    }

    function extractParamNames(node) {
      let params = []
      let current = node

      while (current && current.type === "ArrowFunctionExpression") {
        if (current.params.length === 1 && current.params[0].type === "Identifier") {
          params.push(current.params[0].name)
        } else if (current.params.length > 0) {
          params.push(`(${current.params.map((p) => sourceCode.getText(p)).join(", ")})`)
        }

        if (current.body.type === "ArrowFunctionExpression") {
          current = current.body
        } else {
          break
        }
      }

      return params
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

    function countCallChainLength(node) {
      let count = 1
      let current = node.callee

      while (current && current.type === "CallExpression") {
        count++
        current = current.callee
      }

      return count
    }

    function isPartOfLargerCallChain(node) {
      return node.parent && node.parent.type === "CallExpression" && node.parent.callee === node
    }

    return {
      VariableDeclarator(node) {
        if (
          node.init &&
          node.init.type === "ArrowFunctionExpression" &&
          node.id.type === "Identifier"
        ) {
          let curryLevels = countCurryLevels(node.init)

          if (curryLevels >= 2) {
            curriedFunctions.set(node.id.name, {
              node: node,
              curryLevels: curryLevels,
              params: extractParamNames(node.init),
              isExported: isExported(node),
            })
          }
        }
      },

      CallExpression(node) {
        if (isPartOfLargerCallChain(node)) {
          return
        }

        let current = node
        while (current.callee && current.callee.type === "CallExpression") {
          current = current.callee
        }

        if (current.callee && current.callee.type === "Identifier") {
          let fnName = current.callee.name
          let chainLength = countCallChainLength(node)

          if (!allFunctionCalls.has(fnName)) {
            allFunctionCalls.set(fnName, [])
          }
          allFunctionCalls.get(fnName).push(chainLength)
        }
      },

      "Program:exit"() {
        curriedFunctions.forEach((fnInfo, fnName) => {
          if (fnInfo.isExported) {
            return
          }

          let calls = allFunctionCalls.get(fnName) || []

          if (calls.length === 0) {
            return
          }

          let allCallsFullyApplied = calls.every(
            (chainLength) => chainLength === fnInfo.curryLevels,
          )

          if (allCallsFullyApplied) {
            context.report({
              node: fnInfo.node,
              messageId: "unnecessaryCurrying",
              data: {
                name: fnName,
                params: fnInfo.params.join(", "),
              },
            })
          }
        })
      },
    }
  },
}
