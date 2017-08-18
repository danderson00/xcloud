const colorGenerator = require('../src/colorGenerator')

test("createGenerator produces increasingly light colors", () => {
  const generator = colorGenerator.createGenerator({
    from: { r: 34, g: 85, b: 153 },
    to: { r: 255, g: 255, b: 255 }
  }, 10)
  expect(generator(10)).toEqual({ r: 34, g: 85, b: 153 })
  expect(generator(8)).toEqual({ r: 78, g: 119, b: 173 })
  expect(generator(1)).toEqual({ r: 233, g: 238, b: 245 })
})