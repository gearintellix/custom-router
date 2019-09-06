export default class Route {
  constructor(path, callback, {
    method = [],
    // param constraints - map of functions or regex
    constraints = {},
    // default param values - map of functions or values
    defaults = {}
  }) {
    this.path = path
    // empty array = ANY
    this.method = new Set(Array.isArray(method) ? method : [method])
    this.constraints = constraints
    this.defaults = defaults
    this.callback = async (...args) => callback(...args)
    this.validators = {
      RegExp:   (check, params, key) => !!check.test(params[key]),
      Array:    (check, params, key) => !!check.includes(params[key]),
      Function: (check, params, key) => !!check(params[key], key),
      Boolean:  (check, params, key) => check === !!params[key]
    }
    this.validationPipeline = [
      (params, method) => !!params,
      (params, method) => this.method.length === 0 || this.method.has(method)
    ]

    // add constraint checks to pipeline
    if (typeof this.constraints == 'function') {
      this.validationPipeline.push((params, method) => this.constraints(params))
    } else {
      Object.entries(this.constraints).find(([key, check]) => {
        // verify constraints are valid
        const type = check.constructor.name
        const validator = this.validators[type]
  
        if (!validator) {
          throw new Error(`Unknown validator: ${type}`)
        }
  
        this.validationPipeline.push((params, _) => !params.hasOwnProperty(key) || validator(check, params, key))
      })
    }
  }

  applyDefaults(params) {
    if (!params) {
      return params
    }
    return Object.assign({}, typeof this.defaults === 'function' ? this.defaults(params) : this.defaults, params)
  }

  validate(params, method) {
    return !this.validationPipeline.find(pipe => !pipe(params, method))
  }
}
