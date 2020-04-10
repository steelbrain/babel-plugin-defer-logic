# Babel Plugin Defer Logic

JS equivalent of Golang's `defer` and Python's `with` statements.

### Installation

```
yarn add --dev babel-plugin-defer-logic
# OR
npm install --save-dev babel-plugin-defer-logic
```

### Setup

Add `babel-plugin-defer-logic` to your babel config's `plugins` section. Try to add it to the end so it runs the last transformations.

eg:
```
{
  "presets": ["@babel/preset", { "targets": { "node": 12 } }],
  "plugins": ["babel-plugin-defer-logic"]
}
```

### Usage

This package converts the contents of `defer` calls to be in a function body's finally. Multiple arguments are supported and will be handled individually.

Function literals are supported, the body of the function is copied as a block to the finally part.
Function references are treated as ordinary variables, so you'll have to do `defer(myFunc())` instead of `defer(myFunc)`

You can however do

```js
defer(() => {
  // This is good
})
defer(function() {
  // This is good
})
defer(async function() {
  // This is still good, as long as parent function is also an async function
})
```

More usages:

```js
// From
function hello() {
  setIsLoading(true)
  defer(setIsLoading(false))
  // .. Do the work
}
// To
function hello() {
  try {
    setIsLoading(true)
    // .. Do the work
  } finally {
    setIsLoading(false)
  }
}

function hello() {
  try {
    setIsLoading(true)
    setIsConnected(false)
    defer(setIsLoading(false))
    defer(setIsConnected(true))
    // .. Do the work
  } catch (error) {
    console.log(error)
  }
}
// To
function hello() {
  try {
    try {
      setIsLoading(true)
      setIsConnected(false)
      // .. Do the work
    } catch (error) {
      console.log(error)
    }
  } finally {
    setIsLoading(false)
    setIsConnected(true)
  }
}
```

### LICENSE

The contents of this package/repository are licensed under the terms of MIT License. See the LICENSE file for more info.
