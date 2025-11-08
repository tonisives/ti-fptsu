module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce file layout: exported types/functions/constants first, then private functions",
      category: "Stylistic Issues",
      recommended: true,
    },
    messages: {
      privateBeforeExport:
        "Private {{type}} '{{name}}' should be declared after all exports",
      exportAfterPrivate:
        "Exported {{type}} '{{name}}' should be declared before private declarations",
    },
    schema: [],
  },

  create(context) {
    const declarations = []

    function isExported(node) {
      if (!node.parent) return false

      // Check if it's an ExportNamedDeclaration or ExportDefaultDeclaration
      if (
        node.parent.type === "ExportNamedDeclaration" ||
        node.parent.type === "ExportDefaultDeclaration"
      ) {
        return true
      }

      // For module.exports or exports.x patterns
      return false
    }

    function getDeclarationType(node) {
      switch (node.type) {
        case "FunctionDeclaration":
          return "function"
        case "VariableDeclaration":
          return node.kind // const, let, var
        case "ClassDeclaration":
          return "class"
        case "TSTypeAliasDeclaration":
          return "type"
        case "TSInterfaceDeclaration":
          return "interface"
        case "TSEnumDeclaration":
          return "enum"
        default:
          return "declaration"
      }
    }

    function getDeclarationName(node) {
      if (node.id && node.id.name) {
        return node.id.name
      }
      if (node.type === "VariableDeclaration" && node.declarations.length > 0) {
        const firstDeclarator = node.declarations[0]
        if (firstDeclarator.id && firstDeclarator.id.name) {
          return firstDeclarator.id.name
        }
      }
      return "unknown"
    }

    function checkTopLevelDeclaration(node) {
      // Only check top-level declarations
      if (node.parent.type !== "Program" && node.parent.type !== "ExportNamedDeclaration" && node.parent.type !== "ExportDefaultDeclaration") {
        return
      }

      const isExport = isExported(node)
      const type = getDeclarationType(node)
      const name = getDeclarationName(node)

      declarations.push({
        node,
        isExport,
        type,
        name,
        line: node.loc.start.line,
      })
    }

    return {
      FunctionDeclaration: checkTopLevelDeclaration,
      VariableDeclaration: checkTopLevelDeclaration,
      ClassDeclaration: checkTopLevelDeclaration,
      TSTypeAliasDeclaration: checkTopLevelDeclaration,
      TSInterfaceDeclaration: checkTopLevelDeclaration,
      TSEnumDeclaration: checkTopLevelDeclaration,

      "Program:exit"() {
        if (declarations.length === 0) return

        // Find the first private declaration
        const firstPrivateIndex = declarations.findIndex((d) => !d.isExport)
        if (firstPrivateIndex === -1) return // All exports, no problem

        // Check if any exports come after the first private declaration
        for (let i = firstPrivateIndex + 1; i < declarations.length; i++) {
          const decl = declarations[i]
          if (decl.isExport) {
            context.report({
              node: decl.node,
              messageId: "exportAfterPrivate",
              data: {
                type: decl.type,
                name: decl.name,
              },
            })
          }
        }
      },
    }
  },
}
