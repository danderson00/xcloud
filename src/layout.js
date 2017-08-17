const bounds = require('./bounds')

const layout = module.exports = {
  next: function (index, options, outputWords, outputWord) {
    return layout[options.shape](index, outputWord, outputWords, options.width, options.height)
  },
  
  elliptic: function (index, outputWord, outputWords, width, height) {
    let currentAngle = Math.random() * 6.28
    let radius = 0.0
    let step = 2.0
    let aspectRatio = width / height
    
    while (bounds.hitTest(outputWord, outputWords)) {
      radius += step
      currentAngle += (index % 2 === 0 ? 1 : -1) * step

      outputWord.left = ((width - outputWord.width) / 2.0) + (radius * Math.cos(currentAngle)) * aspectRatio
      outputWord.top = ((height - outputWord.height) / 2.0) + radius * Math.sin(currentAngle)
    }
    
    return outputWord
  },

  rectangular: function (index, outputWord, outputWords, width, height) {
    let stepsInDirection = 0.0
    let quarterTurns = 0.0
    let step = 18.0
    let aspectRatio = width / height
    
    while (bounds.hitTest(outputWord, outputWords)) {
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