"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _routeParser = _interopRequireDefault(require("route-parser"));

var _route = _interopRequireDefault(require("./route"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class RouteResolver {
  constructor() {
    this.cache = {};
  }

  build(spec, callback, options) {
    this.buildMatcher(spec);
    return new _route.default(spec, callback, options);
  }

  buildMatcher(spec) {
    return this.cache[spec] || (this.cache[spec] = new _routeParser.default(spec));
  }

  match(spec, path) {
    var matcher = this.buildMatcher(spec);
    var params = matcher.match(path);

    if (params === false) {
      return null;
    } // remove undefined params


    Object.keys(params).forEach(key => {
      if (params[key] === undefined) {
        delete params[key];
      }
    });
    return params;
  }

}

exports.default = RouteResolver;