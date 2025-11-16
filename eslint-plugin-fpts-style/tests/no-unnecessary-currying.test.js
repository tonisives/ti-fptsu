const { RuleTester } = require("eslint")
const rule = require("../rules/no-unnecessary-currying")

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

ruleTester.run("no-unnecessary-currying", rule, {
  valid: [
    // Regular function with multiple parameters - not curried
    {
      code: `
        let add = (a, b) => a + b
        let result = add(1, 2)
      `,
    },
    // Single-level arrow function
    {
      code: `
        let double = (x) => x * 2
        let result = double(5)
      `,
    },
    // Exported curried function - should not warn
    {
      code: `
        export let processCluster = (db) => (cluster) => cluster.id
        let result = processCluster(db)(cluster)
      `,
    },
    // Curried function that IS partially applied
    {
      code: `
        let add = (a) => (b) => a + b
        let add5 = add(5)
        let result = add5(3)
      `,
    },
    // Curried function with mixed usage (partial and full)
    {
      code: `
        let curry3 = (a) => (b) => (c) => a + b + c
        let partial = curry3(1)
        let result1 = partial(2)(3)
        let result2 = curry3(1)(2)(3)
      `,
    },
    // Curried function that's never called - no warning
    {
      code: `
        let unused = (a) => (b) => a + b
      `,
    },
  ],

  invalid: [
    // Simple 2-level curried function always fully applied
    {
      code: `
        let add = (a) => (b) => a + b
        let result = add(1)(2)
      `,
      errors: [
        {
          messageId: "unnecessaryCurrying",
          data: {
            name: "add",
            params: "a, b",
          },
        },
      ],
    },
    // 3-level curried function always fully applied
    {
      code: `
        let add3 = (a) => (b) => (c) => a + b + c
        let result1 = add3(1)(2)(3)
        let result2 = add3(4)(5)(6)
      `,
      errors: [
        {
          messageId: "unnecessaryCurrying",
          data: {
            name: "add3",
            params: "a, b, c",
          },
        },
      ],
    },
    // 4-level curried function from real code
    {
      code: `
        let handleConvergedCluster =
          (db) => (cluster) => (posts) => (convergence) =>
            convergence.score > 0.5

        let result = handleConvergedCluster(db)(cluster)(posts)(convergence)
      `,
      errors: [
        {
          messageId: "unnecessaryCurrying",
          data: {
            name: "handleConvergedCluster",
            params: "db, cluster, posts, convergence",
          },
        },
      ],
    },
    // 5-level curried function
    {
      code: `
        let saveIdeaAndMarkAnalyzed =
          (db) =>
          (cluster) =>
          (posts) =>
          (convergence) =>
          (idea) =>
            ({ saved: true })

        let result = saveIdeaAndMarkAnalyzed(db)(cluster)(posts)(convergence)(idea)
      `,
      errors: [
        {
          messageId: "unnecessaryCurrying",
          data: {
            name: "saveIdeaAndMarkAnalyzed",
            params: "db, cluster, posts, convergence, idea",
          },
        },
      ],
    },
    // Multiple calls all fully applied
    {
      code: `
        let process = (a) => (b) => (c) => a + b + c

        let test1 = () => {
          process(1)(2)(3)
          process(4)(5)(6)
          process(7)(8)(9)
        }
      `,
      errors: [
        {
          messageId: "unnecessaryCurrying",
        },
      ],
    },
    // Non-exported curried function in pipe
    {
      code: `
        import { pipe } from "ti-fptsu/lib"

        let helper = (db) => (cluster) => (posts) =>
          pipe(
            posts,
            () => cluster.id
          )

        let usage = () => helper(db)(cluster)(posts)
      `,
      errors: [
        {
          messageId: "unnecessaryCurrying",
          data: {
            name: "helper",
            params: "db, cluster, posts",
          },
        },
      ],
    },
  ],
})

console.log("All no-unnecessary-currying tests passed!")
