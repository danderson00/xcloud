const fontSizes = require('./fontSizes')
const colorGenerator = require('./colorGenerator')
const bounds = require('./bounds')
const layout = require('./layout')

const defaultOptions = {
  width: 640,
  height: 480,
  steps: 10,
  shape: 'elliptic',
  removeOverflowing: true,
  colors: { r: 34, g: 85, b: 153 },
  fontSize: { from: 0.02, to: 0.07 },
  font: 'Arial'
}

module.exports = function(words, options) {
  options = Object.assign(defaultOptions, options)
  
  words.forEach(word => word.weight = parseFloat(word.weight, 10))
  words.sort((a, b) => b.weight - a.weight)

  const outputWords = []
  const maxWeight = words[0].weight
  const minWeight = words[words.length - 1].weight
  const sizes = fontSizes.generate(options.fontSize, options.steps, options.width, options.height)
  const colors = colorGenerator.generate(options.colors, options.steps)

  words.forEach((word, index) => layoutWord(index, word))

  return outputWords
  
  function layoutWord(index, word) {
    const weight = fontSizes.mapWeightToScale(word.weight, minWeight, maxWeight, options.steps)
    const dimensions = options.measureText(word.text, options.font, sizes[weight - 1])
    
    const outputWord = layout.next(index, options, outputWords, {
      color: colors[weight - 1],
      size: sizes[weight - 1],
      weight: weight,
      text: word.text,
      font: options.font,
      width: dimensions.width,
      height: dimensions.height,
      left: (options.width - dimensions.width) / 2.0,
      top: (options.height - dimensions.height) / 2.0
    })

    if (!(options.removeOverflowing && bounds.outsideContainer(outputWord, options.width, options.height)))
      outputWords.push(outputWord)
  }
}
