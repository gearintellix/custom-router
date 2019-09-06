import Router from './router'
import RouteResolver from './route_resolver'

export default function router (requestParser, routeResolver = new RouteResolver()) {
  return new Router(requestParser, routeResolver)
}
