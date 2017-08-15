module.exports = {
  overlapping: function (a, b) {
    return (Math.abs(2.0 * a.left + a.width - 2.0 * b.left - b.width) < a.width + b.width) ||
        (Math.abs(2.0 * a.top + a.height - 2.0 * b.top - b.height) < a.height + b.height);
  },

  hitTest: function (newWord, existingWords) {
    return existingWords.some(word => module.exports.overlapping(newWord, word))
  },

  outsideContainer: function (word, width, height) {
    return (
        word.left < 0 || word.top < 0 ||
        (word.left + word.width) > width ||
        (word.top + word.height) > height
    )
  }
}