const fontSizes = require('./fontSizes')
const colorGenerator = require('./colorGenerator')
const bounds = require('./bounds')
const layout = require('./layout')

const defaultOptions = {
  width: 640,
  height: 480,
  padding: 0,
  steps: 10,
  shape: 'elliptic',
  removeOverflowing: true,
  colors: { from: { r: 34, g: 85, b: 153 }, to: { r: 227, g: 236, b: 249 } },
  fontSize: { from: 0.02, to: 0.07 },
  font: 'Arial'
}

module.exports = function(words, options) {
  options = Object.assign({}, defaultOptions, options)
  
  words.forEach(word => word.weight = parseFloat(word.weight, 10))
  words.sort((a, b) => b.weight - a.weight)

  const outputWords = []
  const maxWeight = words[0].weight
  const minWeight = words[words.length - 1].weight
  const sizes = fontSizes.generate(options.fontSize, options.steps, options.width, options.height)
  const colors = colorGenerator.generate(options.colors, options.steps)
  
  if(options.previous)
    layoutFromPrevious()
  else
    words.forEach((word, index) => layoutWord(index, word))

  return outputWords
  
  function layoutFromPrevious() {
    const previousWords = options.previous.reduce((words, word) => (words[word.text] = word, words), {})
    const wordsForSecondPass = []
    const wordsForThirdPass = []
    
    // first pass - lay out each word that was previously rendered in the same place, if possible
    words.forEach(word => {
      const previousWord = previousWords[word.text]
      const weight = fontSizes.mapWeightToScale(word.weight, minWeight, maxWeight, options.steps)
      const dimensions = options.measureText(word.text, options.font, sizes[weight - 1])
  
      if(previousWord) {
        const outputWord = createOutputWord(word, weight, dimensions, 
          previousWord.left - (dimensions.width - previousWord.width) / 2.0, 
          previousWord.top - (dimensions.height - previousWord.height) / 2.0)

        if(!bounds.hitTest(outputWord, outputWords)) {
          outputWords.push(outputWord)
        } else {
          wordsForSecondPass.push(word)
        }
      } else {
        wordsForThirdPass.push(word)
      }
    })

    // second pass - lay out each word that couldn't be placed in first pass
    wordsForSecondPass.forEach((word, index) => layoutWord(index, word))

    // third pass - lay out remaining words with no previous word
    wordsForThirdPass.forEach((word, index) => layoutWord(index, word))    
  }

  function layoutWord(index, word) {
    const weight = fontSizes.mapWeightToScale(word.weight, minWeight, maxWeight, options.steps)
    const dimensions = options.measureText(word.text, options.font, sizes[weight - 1])
    
    const outputWord = layout.next(index, options, outputWords, 
      createOutputWord(word, weight, dimensions, (options.width - dimensions.width) / 2.0, (options.height - dimensions.height) / 2.0)
    )

    if (!(options.removeOverflowing && bounds.outsideContainer(outputWord, options.width, options.height)))
      outputWords.push(outputWord)
  }

  function createOutputWord(word, weight, dimensions, left, top) {
    return {
      color: colors[weight - 1],
      size: sizes[weight - 1],
      weight: weight,
      text: word.text,
      font: options.font,
      width: dimensions.width,
      height: dimensions.height,
      left: left,
      top: top
    }
  }
}

module.exports.defaultOptions = defaultOptions