module.exports = {
  generate: function (option, steps) {
    const generator = module.exports.createGenerator(option, steps)
    let result = []

    for (var i = 1; i <= steps; i++) {
      result.push(generator(i))
    }

    return result
  },
  createGenerator: function(option, steps) {
    if (typeof option == 'function') {
      return option

    } else if (typeof option === 'object') {
      return function (weight) {
        return {
          r: Math.round(option.from.r + ((option.to.r - option.from.r) * (1 / steps) * (steps - weight))),
          g: Math.round(option.from.g + ((option.to.g - option.from.g) * (1 / steps) * (steps - weight))),
          b: Math.round(option.from.b + ((option.to.b - option.from.b) * (1 / steps) * (steps - weight)))
        }
      }
    }
  }
}