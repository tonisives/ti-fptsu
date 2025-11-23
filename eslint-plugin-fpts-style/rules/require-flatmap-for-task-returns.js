module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Require flatMap/chain when returning Tasks from functions in pipe",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      requireFlatMap:
        "Task returned from function must be flatMap-d, not just returned. Use flatMap/chain to properly sequence the Task.",
    },
    fixable: null,
    schema: [],
  },

  create(context) {
    let hasFptsImport = false
    let taskNamespaces = new Set()

    function isTaskConstructor(node) {
      // Check for t.of(), t.Task, etc.
      if (
        node.type === "CallExpression" &&
        node.callee.type === "MemberExpression" &&
        node.callee.object.type === "Identifier" &&
        taskNamespaces.has(node.callee.object.name)
      ) {
        return true
      }

      // Check for function calls that likely return Tasks
      // This includes functions like releaseJobLockAfterError, closeDbOnError
      if (node.type === "CallExpression") {
        return true
      }

      // Check for conditional expressions that might return Tasks
      if (node.type === "ConditionalExpression") {
        return isTaskConstructor(node.consequent) || isTaskConstructor(node.alternate)
      }

      return false
    }

    function isInsidePipe(node) {
      let parent = node.parent
      while (parent) {
        if (
          parent.type === "CallExpression" &&
          parent.callee &&
          parent.callee.type === "Identifier" &&
          parent.callee.name === "pipe"
        ) {
          return true
        }
        parent = parent.parent
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

          node.specifiers.forEach((spec) => {
            if (spec.type === "ImportNamespaceSpecifier" || spec.type === "ImportSpecifier") {
              // Track namespaces that might be Task-related
              // Common patterns: import * as t from 'fp-ts/Task'
              taskNamespaces.add(spec.local.name)
            }
          })
        }
      },

      ArrowFunctionExpression(node) {
        if (!hasFptsImport) return

        // Check if we're inside a pipe
        if (!isInsidePipe(node)) return

        // Check if this arrow function is a direct argument to pipe
        // (not wrapped in flatMap/chain)
        const parent = node.parent

        // If the parent is a CallExpression, check if it's flatMap/chain
        if (parent && parent.type === "CallExpression") {
          // If the arrow function is wrapped in a call (like flatMap or chain), skip it
          if (
            parent.callee &&
            parent.callee.type === "MemberExpression" &&
            parent.callee.property &&
            parent.callee.property.type === "Identifier" &&
            (parent.callee.property.name === "flatMap" ||
             parent.callee.property.name === "chain" ||
             parent.callee.property.name === "map")
          ) {
            return
          }
        }

        // Get the function body
        const body = node.body

        // Skip if it's a block statement (we only check implicit returns)
        if (body.type === "BlockStatement") return

        // Check if the body returns a Task without using flatMap
        if (isTaskConstructor(body)) {
          context.report({
            node: node,
            messageId: "requireFlatMap",
          })
        }
      },
    }
  },
}
