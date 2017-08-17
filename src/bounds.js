var bounds = module.exports = {
  overlapping: function (a, b) {
    return !(b.left > a.left + a.width 
      || a.left > b.left + b.width
      || b.top > a.top + a.height
      || a.top > b.top + b.height)
  },

  hitTest: function (newWord, existingWords) {
    return existingWords.some(word => bounds.overlapping(newWord, word))
  },

  outsideContainer: function (word, width, height) {
    return word.left < 0 
      || word.top < 0
      || (word.left + word.width) > width
      || (word.top + word.height) > height
  }
}