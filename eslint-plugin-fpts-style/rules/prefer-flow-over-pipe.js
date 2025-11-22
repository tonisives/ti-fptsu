module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer flow over pipe when the function argument is used as the first parameter",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      preferFlow:
        "Use 'flow' instead of 'pipe' when the function parameter is the first argument to pipe. The parameter '{{param}}' can be removed and 'pipe' replaced with 'flow'.",
    },
    fixable: "code",
    schema: [],
  },

  create(context) {
    let hasFptsImport = false

    function isPipeCall(node) {
      return (
        node.type === "CallExpression" &&
        node.callee.type === "Identifier" &&
        node.callee.name === "pipe"
      )
    }

    function isArrowFunction(node) {
      return node.type === "ArrowFunctionExpression"
    }

    function getParameterName(arrowFunction) {
      if (arrowFunction.params && arrowFunction.params.length === 1) {
        const param = arrowFunction.params[0]
        if (param.type === "Identifier") {
          return param.name
        }
      }
      return null
    }

    function isIdentifierReferenceToParam(node, paramName) {
      return (
        node.type === "Identifier" &&
        node.name === paramName
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

      ArrowFunctionExpression(node) {
        if (!hasFptsImport) return

        const paramName = getParameterName(node)
        if (!paramName) return

        if (!isArrowFunction(node)) return

        const body = node.body

        if (!isPipeCall(body)) return

        if (body.arguments.length < 2) return

        const firstArg = body.arguments[0]
        if (isIdentifierReferenceToParam(firstArg, paramName)) {
          context.report({
            node: node,
            messageId: "preferFlow",
            data: {
              param: paramName,
            },
            fix(fixer) {
              const sourceCode = context.getSourceCode()
              const pipeArgs = body.arguments.slice(1)
              const pipeArgsText = pipeArgs
                .map((arg) => sourceCode.getText(arg))
                .join(",\n    ")

              return fixer.replaceText(
                node,
                `flow(\n    ${pipeArgsText},\n  )`,
              )
            },
          })
        }
      },
    }
  },
}
