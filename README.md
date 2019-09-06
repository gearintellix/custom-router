# custom-router

This is a Node.js router which does not include (or require) an HTTP server. It is meant to match request data passed to it from any HTTP server you wish with configured routes and triggers callbacks. A good example of where routing is not built-in is AWS Lambda, in which case **custom-router** works perfectly as a proxy for an AWS Lambda handler.

## Configuration

The router makes no assumptions about what kind of request object you're using. It acts more like a proxy for your original request. You simply need to specify a function which returns the `method` and `path` that routes can be matched against. (Default matching is provided by [`route-parser`](https://github.com/rcs/route-parser).)

This means you could use Express, Koa or some other web server request such as AWS Lambda.

### Request Resolver

The router can work with any request/response you need.

A typical HTTP server may supply a `request` and `response` like this:

```es6
import router from "custom-router"

// Simply specify the `method` and `path`. You could potentially return the request object directly.
// NOTE: the arguments passed here will also be made available to each route callback (see below)
const resolver = (req, _res) => {
  return {
    method: req.method,
    path: req.path,
    // NOTE: any additional data is passed as part of the `context` argument in your route callback
  }
}
```

We'll continue our examples using an AWS Lambda example:

```es6
// AWS Lambda handlers receive an event, context and callback, and we return the `method` and `path`
const resolver = (event, _context, _callback) => {
  return {
    method: event.httpMethod,
    path: event.path,
    // NOTE: any additional data is passed as part of the `context` argument in your route callback
  }
}

// Instantiate a router w/ any function which returns `method` and `path`.
// (You can pass back any other data with it, which will be available to your route callbacks.)
const r = router(resolver)


r.get('/some-path/:param', (params, context, ...request) => {
  // params matched from the path
  const { param } = params
  // data returned by the function passed to the router
  const { method, path, ...rest } = context
  // all arguments passed to the function which returned the context data
  const [ _event, _context, _callback ] = request
})

// `handle` accepts the incoming request like any callback in your server would.
// AWS Lambda can use this directly to accept the `event`, `context` and `callback` params.
export r.handle
```

### Route Path Matchers

Each HTTP method can be matched. All matchers are `async` and return a `Promise`.

```es6
import router from "custom-router"

// ... define your `resolver`

const r = router(resolver)

// Specify one or more HTTP methods
r.match('/path-one', { method: 'GET' }, () => { /* response */ })
r.match('/path-two', { method: ['GET', 'POST'] }, () => { /* response */ })
// or
r.get(/* ... */)
r.post(/* ... */)
r.put(/* ... */)
r.delete(/* ... */)
r.options(/* ... */)

// No method matches *any* HTTP method
r.match('/path-three', () => { /* response */ })
// or
r.any(/* ... */)
```

You can match some special cases.

```es6
// specify a callback for any unknown route path
r.unknown((context, ...request) => {
  // Receives the same arguments as a route callback, except no path params because there was no match.
})

// specify a callback for any exception
r.error((error, params, context, ...request) => {
  // Receives the same arguments as a route callback, with the exception as the additional first argument.
})
```

### Route Path Options

Each route matcher has options for `defaults` and `constraints` in addition to `method`.

```es6
// You can specify a function for defaults
const defaultsFunction = params => { /* return default values (don't modify `params`) */ }

// You can specify an object
const defaultsObject = { /* whatever you want, which will get merged in to `params` */ }

// You can specify a function to validate constraints
const constraintsFunction = params => { /* throw an exception if params are invalid */ }

// You can specify an object with each key matching a route param.
// NOTE: only keys which are present in the params are matched (optional params may not be present)
const constraintsObject = {
  // RegExp to match specific pattern
  param1: /^\d+$/,
  // Array to match whitelisted values
  param2: ['A', 'B'],
  // Function for custom validation
  param3: (value, _key) => !!value,
  // Boolean to match truthy or falsy values
  param4: true
}

// Options can be either one
const options = {
  defaults: defaultsObject,
  constraints: constraintsObject
}

r.get('/some-path/:param1/:param2(/:param3/:param4)', options, () => { /* ... */ })
```

### Route Path Resolver

The default path matcher ([`RouteResolver`](./route_resolver.js)) uses [`route-parser`](https://github.com/rcs/route-parser) internally. You can specify a custom path matcher, which needs to respond to `build` and `match`.

```es6
const resolver = {
  // Used in case you need to compile your parser.
  // Must return an instance of a `Route`.
  // * `spec` is the path pattern such as "/path/:param"
  build (spec, callback, options) {
    // build your `spec` parser
    return new Route(spec, callback, options)
  },

  // Must return a params object (can be empty) or `null` if not matched.
  // * `spec` is the path pattern such as "/path/:param"
  // * `path` is the actual request path such as "/users/username"
  match (spec, path) {
    // totally contrived example:
    if (spec === '/path/:param' && path === '/users/username') {
      return {
        param: 'username'
      }
    } else {
      return null
    }
  }
}
```
