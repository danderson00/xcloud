module.exports = {
  createGenerator: function(option, steps) {
    if (typeof option == 'function') {
      return option

    } else if (typeof option === 'object') {
      return function (weight) {
        return {
          r: Math.round(option.r + ((256 - option.r) * (1 / steps) * (steps - weight))),
          g: Math.round(option.g + ((256 - option.g) * (1 / steps) * (steps - weight))),
          b: Math.round(option.b + ((256 - option.b) * (1 / steps) * (steps - weight)))
        }
      }
    }
  }
}