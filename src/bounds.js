var bounds = module.exports = {
  overlapping: function (a, b) {
    return between(a.left, b.left, b.width)
      || between(b.left, a.left, a.width)
      || between(a.top, b.top, b.height)
      || between(b.top, a.top, a.height)

    function between(value, min, increase) {
      return value > min && value < min + increase
    }
  },

  hitTest: function (newWord, existingWords) {
    return existingWords.some(word => bounds.overlapping(newWord, word))
  },

  outsideContainer: function (word, width, height) {
    return word.left < 0 || word.top < 0
      || (word.left + word.width) > width
      || (word.top + word.height) > height
  }
}