module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow imports from fp-ts/lib modules that are re-exported in ti-fptsu/lib",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      noFpTsLibImport:
        "Do not import from 'fp-ts/lib'. Use 'ti-fptsu/lib' instead (e.g., import { pipe, e, te } from 'ti-fptsu/lib')",
    },
    schema: [],
  },

  create(context) {
    // List of fp-ts modules that are re-exported in ti-fptsu/lib
    const reexportedModules = [
      "IO.js",
      "Option.js",
      "Either.js",
      "TaskEither.js",
      "Task.js",
      "ReaderTaskEither.js",
      "Array.js",
      "NonEmptyArray.js",
      "boolean.js",
      "function.js",
    ]

    return {
      ImportDeclaration(node) {
        const importSource = node.source.value

        // Check if importing from fp-ts/lib
        if (importSource.startsWith("fp-ts/lib/")) {
          const moduleName = importSource.replace("fp-ts/lib/", "")

          // Only flag imports from modules that are re-exported in ti-fptsu/lib
          if (reexportedModules.includes(moduleName)) {
            context.report({
              node: node,
              messageId: "noFpTsLibImport",
            })
          }
        }
      },
    }
  },
}
