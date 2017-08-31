var bounds = require('./bounds')

var layout = module.exports = {
  next: function (index, options, outputWords, outputWord) {
    return layout[options.shape](index, outputWord, outputWords, options.width, options.height, options.padding)
  },

  elliptic: function (index, outputWord, outputWords, width, height, padding) {
    var currentAngle = Math.random() * 6.28
    var radius = 0.0
    var step = 2.0
    var aspectRatio = width / height
    
    while (bounds.hitTest(outputWord, outputWords, padding)) {
      radius += step
      currentAngle += (index % 2 === 0 ? 1 : -1) * step

      outputWord.left = ((width - outputWord.width) / 2.0) + (radius * Math.cos(currentAngle)) * aspectRatio
      outputWord.top = ((height - outputWord.height) / 2.0) + radius * Math.sin(currentAngle)
    }
    
    return outputWord
  },

  rectangular: function (index, outputWord, outputWords, width, height, padding) {
    var stepsInDirection = 0.0
    var quarterTurns = 0.0
    var step = 18.0
    var aspectRatio = width / height
    
    while (bounds.hitTest(outputWord, outputWords, padding)) {
      stepsInDirection++
      
      if (stepsInDirection * step > (1 + Math.floor(quarterTurns / 2.0)) * step * ((quarterTurns % 4 % 2) === 0 ? 1 : aspectRatio)) {
        stepsInDirection = 0.0
        quarterTurns++
      }

      switch (quarterTurns % 4) {
        case 1:
          outputWord.left += step * aspectRatio + Math.random() * 2.0
          break
        case 2:
          outputWord.top -= step + Math.random() * 2.0
          break
        case 3:
          outputWord.left -= step * aspectRatio + Math.random() * 2.0
          break
        case 0:
          outputWord.top += step + Math.random() * 2.0
          break
      }
    }

    return outputWord     
  }
}