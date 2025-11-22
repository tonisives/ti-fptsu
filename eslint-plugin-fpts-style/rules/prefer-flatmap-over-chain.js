module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer flatMap/tap over deprecated chain functions",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      preferFlatMap: "Use '{{replacement}}' instead of deprecated '{{method}}'.",
    },
    fixable: "code",
    schema: [],
  },

  create(context) {
    let hasFptsImport = false
    let fptsNamespaces = new Set()

    function getReplacementName(chainName) {
      if (chainName === "chain" || chainName === "chainW") {
        return "flatMap"
      }

      if (chainName.startsWith("chainFirst")) {
        const suffix = chainName.substring("chainFirst".length)
        const withoutK = suffix.endsWith("K") ? suffix.slice(0, -1) : suffix
        return "tap" + withoutK
      }

      if (chainName.startsWith("chain")) {
        const suffix = chainName.substring("chain".length)
        const withoutK = suffix.endsWith("K") ? suffix.slice(0, -1) : suffix
        return "flatMap" + withoutK
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

          node.specifiers.forEach((spec) => {
            if (spec.type === "ImportSpecifier") {
              fptsNamespaces.add(spec.local.name)
            }
          })
        }
      },

      MemberExpression(node) {
        if (!hasFptsImport) return

        let property = node.property
        if (
          property &&
          property.type === "Identifier" &&
          property.name.startsWith("chain")
        ) {
          let object = node.object
          if (
            object &&
            object.type === "Identifier" &&
            (fptsNamespaces.has(object.name) ||
              object.name === "te" ||
              object.name === "rte" ||
              object.name === "e" ||
              object.name === "o" ||
              object.name === "io")
          ) {
            const replacement = getReplacementName(property.name)
            if (replacement) {
              context.report({
                node: property,
                messageId: "preferFlatMap",
                data: {
                  method: property.name,
                  replacement: replacement,
                },
                fix(fixer) {
                  return fixer.replaceText(property, replacement)
                },
              })
            }
          }
        }
      },

      Identifier(node) {
        if (!hasFptsImport) return

        if (!node.name.startsWith("chain")) return

        const parent = node.parent
        if (
          parent &&
          parent.type === "CallExpression" &&
          parent.callee === node
        ) {
          const replacement = getReplacementName(node.name)
          if (replacement) {
            context.report({
              node: node,
              messageId: "preferFlatMap",
              data: {
                method: node.name,
                replacement: replacement,
              },
              fix(fixer) {
                return fixer.replaceText(node, replacement)
              },
            })
          }
        }
      },
    }
  },
}
