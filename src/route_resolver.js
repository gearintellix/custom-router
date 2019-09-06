import RouteMatcher from 'route-parser'

export default class RouteResolver {
  constructor () {
    this.cache = {}
  }

  build(spec, callback, options) {
    this.buildMatcher(spec)
    return new Route(spec, callback, options)
  }

  buildMatcher(spec) {
    return this.cache[spec] || (this.cache[spec] = new RouteMatcher(spec))
  }

  match(spec, path) {
    const matcher = this.buildMatcher(spec)
    const params = matcher.match(path)

    if (params === false) {
      return null
    }

    // remove undefined params
    Object.keys(params).forEach(key => {
      if (params[key] === undefined) {
        delete params[key]
      }
    })

    return params
  }
}
