module.exports = {
  generate: function (option, steps, width, height) {
    var generator = module.exports.createGenerator(option, steps)
    var result = []

    for (var i = 1; i <= steps; i++) {
      result.push(generator(width, height, i))
    }

    return result
  },
  createGenerator: function (option, steps) {
    if (typeof option == 'function') {
      return option;

    } else if (typeof option === 'object') {
      return function(width, height, weight) {
        var max = width * option.to
        var min = width * option.from
        return Math.round(min + (max - min) * 1.0 / (steps - 1) * (weight - 1))
      }
    }
  },

  mapWeightToScale: function (weight, minWeight, maxWeight, steps) {
    if(minWeight !== maxWeight)
      return Math.round((weight - minWeight) * 1.0 * (steps - 1) / (maxWeight - minWeight)) + 1
    else
      return Math.round(steps / 2)
  }
}