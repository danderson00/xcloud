let cloud = require('../src')

test("produces output", () => {
  const words = [
    { text: 'test1', weight: 1 },
    { text: 'test2', weight: 2 },
    { text: 'test3', weight: 3 }
  ]
  const result = cloud(words, { measureText })

  expect(result).not.toBe(undefined)
  expect(result.length).toBe(3)
})

test("words are placed in their previous position if possible", () => {
  const words = [
    { text: 'test1', weight: 1 },
    { text: 'test2', weight: 2 }
  ]
  const previous = [
    { text: 'test1', left: 1, top: 1, width: 50, height: 10 },
    { text: 'test2', left: 100, top: 100, width: 50, height: 10 }
  ]

  const result = cloud(words, { measureText, previous })
  expect(result.length).toBe(2)
  expect(result[0].left).toBe(100)
  expect(result[0].top).toBe(100)
  expect(result[1].left).toBe(1)
  expect(result[1].top).toBe(1)
})

test("words are placed normally if unable to be placed in previous position", () => {
  const words = [
    { text: 'test1', weight: 1 },
    { text: 'test2', weight: 2 }
  ]
  const previous = [
    { text: 'test1', left: 110, top: 110, width: 50, height: 10 },
    { text: 'test2', left: 100, top: 100, width: 50, height: 10 }
  ]

  const result = cloud(words, { measureText, previous })
  expect(result.length).toBe(2)
  expect(result[0].left).toBe(100)
  expect(result[0].top).toBe(100)
  expect(result[1].left).toBe(295)
  expect(result[1].top).toBe(235)
})

test("words without previous placement are placed normally", () => {
  const words = [
    { text: 'test1', weight: 1 },
    { text: 'test2', weight: 2 }
  ]
  const previous = [
    { text: 'test2', left: 100, top: 100, width: 50, height: 10 }
  ]

  const result = cloud(words, { measureText, previous })
  expect(result.length).toBe(2)
  expect(result[0].left).toBe(100)
  expect(result[0].top).toBe(100)
  expect(result[1].left).toBe(295)
  expect(result[1].top).toBe(235)
})

function measureText(word) {
  return {
    width: word.length * 10,
    height: 10
  }
}