let cloud = require('../src/xcloud')

test("produces output", () => {
  const words = [
    { text: 'test1', weight: 1 },
    { text: 'test2', weight: 2 },
    { text: 'test3', weight: 3 }
  ]
  const options = { 
    measureText,
    fontSize: { from: 1, to: 6 } 
  }
  const result = cloud(words, options)

  console.log(JSON.stringify(result))
  expect(result).not.toBe(undefined)
  expect(result.length).toBe(3)
})

function measureText(word) {
  return {
    width: word.length * 10,
    height: 10
  }
}