import { NodePath, types } from '@babel/core'

const SYM_DEFER_BLOCK = Symbol('defer block')

export default function() {
  return {
    visitor: {
      CallExpression: {
        // Process on exit, so we get to transform end-result
        exit(path: NodePath<types.CallExpression>) {
          const { callee, arguments: args } = path.node

          // Ignore if not a call to `defer`
          if (callee.type !== 'Identifier' || callee.name !== 'defer') {
            return
          }
          console.log(args)
          // Ignore if `defer` is locally defined
          if (path.scope.hasBinding('defer')) {
            return
          }
          const functionParentPath = path.findParent(item => item.isFunction()) as
            | NodePath<types.FunctionDeclaration | types.ArrowFunctionExpression>
            | undefined

          // Ignore if not inside a function
          if (functionParentPath == null) {
            return
          }

          // Ignore if function body is not a block (think arrow-functions)
          if (functionParentPath.node.body.type !== 'BlockStatement') {
            return
          }
          // Remove call expression from parent
          path.remove()

          const { body } = functionParentPath.node
          let deferBlock = body.body.find(
            item => item.type === 'TryStatement' && item[SYM_DEFER_BLOCK],
          ) as types.TryStatement

          if (deferBlock == null) {
            // Create new block
            deferBlock = types.tryStatement(body, null, types.blockStatement([]))
            deferBlock[SYM_DEFER_BLOCK] = true
            functionParentPath.get('body').replaceWith(types.blockStatement([deferBlock]))
          }

          args.forEach(arg => {
            let argValue: any
            if (types.isFunction(arg)) {
              argValue = arg.body
            } else {
              argValue = arg
            }
            deferBlock.finalizer!.body.push(argValue)
          })
        },
      },
    },
  }
}
