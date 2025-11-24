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
      // Check for t.of(), te.of(), t.Task, etc.
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

    function isDirectPipeArgument(node) {
      // Check if this arrow function is a direct argument to pipe()
      // We want to flag: pipe(t.of(1), () => t.of(2))
      // But NOT flag: pipe(t.of(1), t.flatMap(() => t.of(2)))
      const parent = node.parent

      if (!parent || parent.type !== "CallExpression") {
        return false
      }

      // If parent is a pipe() call, this is a direct argument
      if (parent.callee && parent.callee.type === "Identifier" && parent.callee.name === "pipe") {
        return true
      }

      // If parent is NOT a method call (like flatMap, orElse, etc.), continue checking up
      // This handles cases where the arrow function is NOT wrapped in a method
      if (parent.callee && parent.callee.type === "MemberExpression") {
        // This arrow function is an argument to a method call (flatMap, orElse, etc.)
        // So it's NOT a direct pipe argument
        return false
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
              // Common patterns: import * as t from 'fp-ts/Task', import { te } from 'ti-fptsu/lib'
              taskNamespaces.add(spec.local.name)
            }
          })
        }
      },

      ArrowFunctionExpression(node) {
        if (!hasFptsImport) return

        // Only check if this is a direct argument to pipe()
        if (!isDirectPipeArgument(node)) return

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
