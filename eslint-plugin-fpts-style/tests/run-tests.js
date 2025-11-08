#!/usr/bin/env node

// Run all test files
const fs = require("fs")
const path = require("path")

const testsDir = __dirname
const testFiles = fs
  .readdirSync(testsDir)
  .filter((file) => file.endsWith(".test.js") && file !== "run-tests.js")

console.log("Running ESLint plugin tests...\n")

let allPassed = true

testFiles.forEach((file) => {
  const testPath = path.join(testsDir, file)
  console.log(`Running ${file}...`)
  try {
    require(testPath)
  } catch (error) {
    console.error(`Failed: ${file}`)
    console.error(error)
    allPassed = false
  }
})

if (allPassed) {
  console.log("\nAll tests passed!")
  process.exit(0)
} else {
  console.error("\nSome tests failed!")
  process.exit(1)
}
