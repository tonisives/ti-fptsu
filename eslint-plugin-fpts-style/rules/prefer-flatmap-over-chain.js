module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer flatMap over deprecated chain/chainW methods",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      preferFlatMap: "Use 'flatMap' instead of deprecated '{{method}}' method.",
    },
    fixable: "code",
    schema: [],
  },

  create(context) {
    let hasFptsImport = false
    let fptsNamespaces = new Set()

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
          (property.name === "chain" || property.name === "chainW")
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
            context.report({
              node: property,
              messageId: "preferFlatMap",
              data: {
                method: property.name,
              },
              fix(fixer) {
                return fixer.replaceText(property, "flatMap")
              },
            })
          }
        }
      },
    }
  },
}
