var fontSizes = require('./fontSizes')
var colorGenerator = require('./colorGenerator')
var bounds = require('./bounds')
var layout = require('./layout')

var defaultOptions = {
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
  
  words.forEach(function(word) { word.weight = parseFloat(word.weight, 10) })
  words.sort(function(a, b) { return b.weight - a.weight })

  var outputWords = []
  var maxWeight = words[0].weight
  var minWeight = words[words.length - 1].weight
  var sizes = fontSizes.generate(options.fontSize, options.steps, options.width, options.height)
  var colors = colorGenerator.generate(options.colors, options.steps)
  
  if(options.previous)
    layoutFromPrevious()
  else
    words.forEach(function(word, index) { layoutWord(index, word) })

  return outputWords
  
  function layoutFromPrevious() {
    var previousWords = options.previous.reduce(function(words, word) { 
      words[word.text] = word
      return words
    }, {})
    var wordsForSecondPass = []
    var wordsForThirdPass = []
    
    // first pass - lay out each word that was previously rendered in the same place, if possible
    words.forEach(function(word) {
      var previousWord = previousWords[word.text]
      var weight = fontSizes.mapWeightToScale(word.weight, minWeight, maxWeight, options.steps)
      var dimensions = options.measureText(word.text, options.font, sizes[weight - 1])
  
      if(previousWord) {
        var outputWord = createOutputWord(word, weight, dimensions, 
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
    wordsForSecondPass.forEach(function(word, index) { layoutWord(index, word) })

    // third pass - lay out remaining words with no previous word
    wordsForThirdPass.forEach(function(word, index) { layoutWord(index, word) })
  }

  function layoutWord(index, word) {
    var weight = fontSizes.mapWeightToScale(word.weight, minWeight, maxWeight, options.steps)
    var dimensions = options.measureText(word.text, options.font, sizes[weight - 1])
    
    var outputWord = layout.next(index, options, outputWords, 
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