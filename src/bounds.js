var bounds = module.exports = {
  overlapping: function (a, b, padding) {
    padding = padding || 0
    return !(b.left - padding > a.left + a.width + padding
      || a.left - padding > b.left + b.width + padding
      || b.top - padding > a.top + a.height + padding
      || a.top - padding > b.top + b.height + padding)
  },

  hitTest: function (newWord, existingWords, padding) {
    return existingWords.some(word => bounds.overlapping(newWord, word, padding))
  },

  outsideContainer: function (word, width, height) {
    return word.left < 0 
      || word.top < 0
      || (word.left + word.width) > width
      || (word.top + word.height) > height
  }
}