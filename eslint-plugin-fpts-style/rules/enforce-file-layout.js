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

    function isVariableFunction(node) {
      if (node.type !== "VariableDeclaration") return false
      if (node.declarations.length === 0) return false

      const declarator = node.declarations[0]
      if (!declarator.init) return false

      // Check if it's a function expression or arrow function
      return (
        declarator.init.type === "ArrowFunctionExpression" ||
        declarator.init.type === "FunctionExpression"
      )
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

        // Find the first private function
        // This includes: function declarations, let declarations, and const function expressions
        // Allow private const variables, types, interfaces, enums at the top
        const firstPrivateFunctionIndex = declarations.findIndex((d) => {
          if (d.isExport) return false

          // Function declarations are always private functions
          if (d.node.type === "FunctionDeclaration") return true

          // let declarations are private functions
          if (d.type === "let") return true

          // const declarations that are functions (arrow or function expressions)
          if (d.type === "const" && isVariableFunction(d.node)) return true

          return false
        })

        if (firstPrivateFunctionIndex === -1) return // No private functions, no problem

        // Check if any exports come after the first private function
        for (let i = firstPrivateFunctionIndex + 1; i < declarations.length; i++) {
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
