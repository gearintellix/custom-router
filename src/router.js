export default class Router {
  constructor(requestParser, routeResolver) {
    this.requestParser = requestParser
    this.routeResolver = routeResolver
    this.routes = []
    this.handle = this.handle.bind(this)
    this.matchPipeline = [
      (______, route, context) => this.routeResolver.match(route.path, context.path),
      (params, route, context) => route.applyDefaults(params),
      (params, route, context) => route.validate(params, context.method) ? params : null,
      (params, route, context, ...request) => (
        params && route.callback(params, context, ...request)
          .catch(this.errorCallback && (ex => this.errorCallback(ex, params, context, ...request)))
      )
    ]
  }

  match(spec, ...args) {
    // options are optional
    const [options, callback] = typeof args[0] === 'function' ? [{}, ...args] : args
    this.routes.push(this.routeResolver.build(spec, callback, options))
    return this
  }

  // handle unknown route
  unknown (callback) {
    this.unknownCallback = async (...args) => callback(...args)
    return this
  }

  error (callback) {
    this.errorCallback = async (...args) => callback(...args)
    return this
  }

  async handle(...request) {
    const context = this.requestParser(...request)
    let response

    this.routes.find(route => {
      response = this.matchPipeline.reduce((last, pipe) => pipe(last, route, context, ...request), null)
      return !!response
    })

    if (response) {
      return response
    } else if (this.unknownCallback) {
      return this.unknownCallback(context, ...request)
    } else {
      throw new Error(`No route matched for: ${context.path}`)
    }
  }
}

// add helper methods... for HTTP methods
['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'ANY'].forEach(method => {
  const methodName = method.toLowerCase()

  if (method === 'ANY') {
    method = []
  }

  Router.prototype[methodName] = function (spec, ...args) {
    // options are optional
    const [options, callback] = typeof args[0] === 'function' ? [{}, ...args] : args
    return this.match(spec, { ...options, method }, callback)
  }
})
