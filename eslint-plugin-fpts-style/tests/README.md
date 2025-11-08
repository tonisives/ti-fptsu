# ESLint Plugin Tests

This directory contains tests for all the custom ESLint rules in the fpts-style plugin.

## Running Tests

From the `eslint-plugin-fpts-style` directory:

```bash
npm test
# or
node tests/run-tests.js
```

## Test Files

- `prefer-a-map.test.js` - Tests for the prefer-a-map rule
- `prefer-flatmap-over-chain.test.js` - Tests for the prefer-flatmap-over-chain rule
- `no-async-await.test.js` - Tests for the no-async-await rule
- `no-const-variables.test.js` - Tests for the no-const-variables rule
- `no-nested-pipes.test.js` - Tests for the no-nested-pipes rule
- `no-statements-outside-pipe.test.js` - Tests for the no-statements-outside-pipe rule

## Writing Tests

Tests use ESLint's built-in `RuleTester` class. Each test file follows this structure:

```javascript
const { RuleTester } = require("eslint")
const rule = require("../rules/rule-name")

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

ruleTester.run("rule-name", rule, {
  valid: [
    // Test cases that should NOT trigger the rule
  ],
  invalid: [
    // Test cases that SHOULD trigger the rule
  ],
})
```

For rules with auto-fix capability, include the `output` property in invalid test cases to verify the fix works correctly.
