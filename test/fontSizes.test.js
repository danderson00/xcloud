const fontSizes = require('../src/fontSizes')

test("createGenerator produces linear scale from provided object", () => {
  var generator = fontSizes.createGenerator({ from: 0, to: 1 }, 10)
  expect(generator(100, 100, 1)).toBe(0)
  expect(generator(100, 100, 2)).toBe(11)
  expect(generator(100, 100, 3)).toBe(22)
  expect(generator(100, 100, 4)).toBe(33)
  expect(generator(100, 100, 5)).toBe(44)
  expect(generator(100, 100, 6)).toBe(56)
  expect(generator(100, 100, 7)).toBe(67)
  expect(generator(100, 100, 8)).toBe(78)
  expect(generator(100, 100, 9)).toBe(89)
  expect(generator(100, 100, 10)).toBe(100)
})

test("mapWeightToScale maps weight to scale from 1 to provided number of steps", () => {
  expect(fontSizes.mapWeightToScale(1, 1, 10, 10)).toBe(1)
  expect(fontSizes.mapWeightToScale(3, 1, 10, 10)).toBe(3)
  expect(fontSizes.mapWeightToScale(10, 1, 10, 10)).toBe(10)

  expect(fontSizes.mapWeightToScale(1, 1, 10, 5)).toBe(1)
  expect(fontSizes.mapWeightToScale(3, 1, 10, 5)).toBe(2)
  expect(fontSizes.mapWeightToScale(10, 1, 10, 5)).toBe(5)

  expect(fontSizes.mapWeightToScale(2, 2, 6, 5)).toBe(1)
  expect(fontSizes.mapWeightToScale(4, 2, 6, 5)).toBe(3)
  expect(fontSizes.mapWeightToScale(6, 2, 6, 5)).toBe(5)
})