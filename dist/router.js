"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

class Router {
  constructor(requestParser, routeResolver) {
    var _this = this;

    this.requestParser = requestParser;
    this.routeResolver = routeResolver;
    this.routes = [];
    this.handle = this.handle.bind(this);
    this.matchPipeline = [(______, route, context) => this.routeResolver.match(route.path, context.path), (params, route, context) => route.applyDefaults(params), (params, route, context) => route.validate(params, context.method) ? params : null, function (params, route, context) {
      for (var _len = arguments.length, request = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
        request[_key - 3] = arguments[_key];
      }

      return params && route.callback(params, context, ...request).catch(_this.errorCallback && (ex => _this.errorCallback(ex, params, context, ...request)));
    }];
  }

  match(spec) {
    for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    // options are optional
    var [options, callback] = typeof args[0] === 'function' ? [{}, ...args] : args;
    this.routes.push(this.routeResolver.build(spec, callback, options));
    return this;
  } // handle unknown route


  unknown(callback) {
    this.unknownCallback = /*#__PURE__*/_asyncToGenerator(function* () {
      return callback(...arguments);
    });
    return this;
  }

  error(callback) {
    this.errorCallback = /*#__PURE__*/_asyncToGenerator(function* () {
      return callback(...arguments);
    });
    return this;
  }

  handle() {
    var _arguments = arguments,
        _this2 = this;

    return _asyncToGenerator(function* () {
      for (var _len3 = _arguments.length, request = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        request[_key3] = _arguments[_key3];
      }

      var context = _this2.requestParser(...request);

      var response;

      _this2.routes.find(route => {
        response = _this2.matchPipeline.reduce((last, pipe) => pipe(last, route, context, ...request), null);
        return !!response;
      });

      if (response) {
        return response;
      } else if (_this2.unknownCallback) {
        return _this2.unknownCallback(context, ...request);
      } else {
        throw new Error("No route matched for: ".concat(context.path));
      }
    })();
  }

} // add helper methods... for HTTP methods


exports.default = Router;
['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'ANY'].forEach(method => {
  var methodName = method.toLowerCase();

  if (method === 'ANY') {
    method = [];
  }

  Router.prototype[methodName] = function (spec) {
    for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      args[_key4 - 1] = arguments[_key4];
    }

    // options are optional
    var [options, callback] = typeof args[0] === 'function' ? [{}, ...args] : args;
    return this.match(spec, _objectSpread(_objectSpread({}, options), {}, {
      method
    }), callback);
  };
});