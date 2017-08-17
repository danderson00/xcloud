const colorGenerator = require('../src/colorGenerator')

test("createGenerator produces increasingly light colors", () => {
  const generator = colorGenerator.createGenerator({ r: 34, g: 85, b: 153 }, 10)
  expect(generator(10)).toEqual({ r: 34, g: 85, b: 153 })
  expect(generator(8)).toEqual({ r: 78, g: 119, b: 174 })
  expect(generator(1)).toEqual({ r: 234, g: 239, b: 246 })
})