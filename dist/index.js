"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = router;

var _router = _interopRequireDefault(require("./router"));

var _route_resolver = _interopRequireDefault(require("./route_resolver"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function router(requestParser) {
  var routeResolver = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new _route_resolver.default();
  return new _router.default(requestParser, routeResolver);
}