"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

class Route {
  constructor(path, callback, _ref) {
    var {
      method = [],
      // param constraints - map of functions or regex
      constraints = {},
      // default param values - map of functions or values
      defaults = {}
    } = _ref;
    this.path = path; // empty array = ANY

    this.method = new Set(Array.isArray(method) ? method : [method]);
    this.constraints = constraints;
    this.defaults = defaults;
    this.callback = /*#__PURE__*/_asyncToGenerator(function* () {
      return callback(...arguments);
    });
    this.validators = {
      RegExp: (check, params, key) => !!check.test(params[key]),
      Array: (check, params, key) => !!check.includes(params[key]),
      Function: (check, params, key) => !!check(params[key], key),
      Boolean: (check, params, key) => check === !!params[key]
    };
    this.validationPipeline = [(params, method) => !!params, (params, method) => this.method.length === 0 || this.method.has(method)]; // add constraint checks to pipeline

    if (typeof this.constraints == 'function') {
      this.validationPipeline.push((params, method) => this.constraints(params));
    } else {
      Object.entries(this.constraints).find((_ref3) => {
        var [key, check] = _ref3;
        // verify constraints are valid
        var type = check.constructor.name;
        var validator = this.validators[type];

        if (!validator) {
          throw new Error("Unknown validator: ".concat(type));
        }

        this.validationPipeline.push((params, _) => !params.hasOwnProperty(key) || validator(check, params, key));
      });
    }
  }

  applyDefaults(params) {
    if (!params) {
      return params;
    }

    return Object.assign({}, typeof this.defaults === 'function' ? this.defaults(params) : this.defaults, params);
  }

  validate(params, method) {
    return !this.validationPipeline.find(pipe => !pipe(params, method));
  }

}

exports.default = Route;