var bounds = require('../src/bounds')

test("overlapping detects overlapping bounds", () => {
  expect(bounds.overlapping(
    { left: 0, top: 0, width: 10, height: 10 },
    { left: 10, top: 0, width: 10, height: 10 }
  )).toBe(false)

  expect(bounds.overlapping(
    { left: 0, top: 0, width: 10, height: 10 },
    { left: 0, top: 10, width: 10, height: 10 }
  )).toBe(false)

  expect(bounds.overlapping(
    { left: 0, top: 0, width: 10, height: 10 },
    { left: 5, top: 0, width: 10, height: 10 }
  )).toBe(true)

  expect(bounds.overlapping(
    { left: 0, top: 0, width: 10, height: 10 },
    { left: 0, top: 5, width: 10, height: 10 }
  )).toBe(true)
})