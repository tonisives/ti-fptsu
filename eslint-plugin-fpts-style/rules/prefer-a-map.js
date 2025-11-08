module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer fp-ts array.map (a.map) over native array.map in functional contexts",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      preferAMap:
        "Use 'a.map' instead of '.map()' method call. Import 'a' from 'fp-ts/Array' or 'ti-fptsu/lib'.",
    },
    fixable: null, // Not auto-fixable as it requires context transformation
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

      CallExpression(node) {
        if (!hasFptsImport) return

        // Check if it's a .map() call
        if (
          node.callee &&
          node.callee.type === "MemberExpression" &&
          node.callee.property &&
          node.callee.property.type === "Identifier" &&
          node.callee.property.name === "map"
        ) {
          let object = node.callee.object

          // Don't report if it's a fp-ts module method like te.map, e.map, o.map, etc.
          // These are the actual fp-ts operations, not array methods
          if (
            object &&
            object.type === "Identifier" &&
            (fptsNamespaces.has(object.name) ||
              object.name === "te" ||
              object.name === "rte" ||
              object.name === "e" ||
              object.name === "o" ||
              object.name === "a" ||
              object.name === "A" ||
              object.name === "array" ||
              object.name === "io" ||
              object.name === "t" ||
              object.name === "option" ||
              object.name === "either")
          ) {
            return
          }

          // Don't report if it's calling map on a call expression result
          // (e.g., the result of a.map(...) or other function calls)
          if (object && object.type === "CallExpression") {
            return
          }

          // Check if we're inside a pipe or fp-ts context
          let parent = node.parent
          let inFptsContext = false

          // Walk up the AST to see if we're in a pipe/fp-ts context
          while (parent) {
            if (
              parent.type === "CallExpression" &&
              parent.callee &&
              parent.callee.type === "Identifier" &&
              parent.callee.name === "pipe"
            ) {
              inFptsContext = true
              break
            }

            // Check if we're in a te.map, te.flatMap, or similar fp-ts call
            if (
              parent.type === "CallExpression" &&
              parent.callee &&
              parent.callee.type === "MemberExpression" &&
              parent.callee.object &&
              parent.callee.object.type === "Identifier" &&
              (fptsNamespaces.has(parent.callee.object.name) ||
                parent.callee.object.name === "te" ||
                parent.callee.object.name === "rte" ||
                parent.callee.object.name === "e" ||
                parent.callee.object.name === "o" ||
                parent.callee.object.name === "a" ||
                parent.callee.object.name === "io")
            ) {
              inFptsContext = true
              break
            }

            parent = parent.parent
          }

          // Only report if we're in an fp-ts context
          if (inFptsContext) {
            context.report({
              node: node.callee.property,
              messageId: "preferAMap",
            })
          }
        }
      },
    }
  },
}
