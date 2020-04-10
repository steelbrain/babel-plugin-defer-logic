/* eslint-disable import/no-extraneous-dependencies */

import pluginTester from 'babel-plugin-tester'
import plugin from './src'

pluginTester({
  plugin,
  pluginName: 'babel-plugin-defer-logic',
  tests: [
    // Does nothing at top-level
    `defer(something())`,
    // Does nothing if defer is defined locally
    `
    function test() {
      let defer = null
      defer(something())
    }`,
    // Does nothing for arrow functions
    `const x = () => defer(something())`,
    // Wraps things for valid cases
    {
      code: `
      function something() {
        defer(something)
        defer(anotherThing())
        defer(() => {
          console.log('hoola')
        })
        defer(function() {
          console.log('goola')
        })
      }`,
      output: `
      function something() {
        try {
        } finally {
          something
          anotherThing()
          {
            console.log('hoola')
          }
          {
            console.log('goola')
          }
        }
      }`,
    },
  ],
})
