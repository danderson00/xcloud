var bounds = require('../src/bounds')

test("overlapping accounts for padding", () => {
  expect(bounds.overlapping(rect(10, 10, 10, 10), rect(21, 21, 10, 10), 0)).toBe(false)
  expect(bounds.overlapping(rect(10, 10, 10, 10), rect(21, 21, 10, 10), 5)).toBe(true)
})

test("overlapping detects overlapping bounds", () => {
  expect(bounds.overlapping(
    { left: 0, top: 0, width: 10, height: 10 },
    { left: 11, top: 0, width: 10, height: 10 }
  )).toBe(false)

  expect(bounds.overlapping(
    { left: 0, top: 0, width: 10, height: 10 },
    { left: 0, top: 11, width: 10, height: 10 }
  )).toBe(false)

  expect(bounds.overlapping(
    { left: 0, top: 0, width: 10, height: 10 },
    { left: 11, top: 5, width: 10, height: 10 }
  )).toBe(false)

  expect(bounds.overlapping(
    { left: 0, top: 0, width: 10, height: 10 },
    { left: 5, top: 11, width: 10, height: 10 }
  )).toBe(false)

  expect(bounds.overlapping(
    { left: 0, top: 0, width: 10, height: 10 },
    { left: 0, top: 0, width: 10, height: 10 }
  )).toBe(true)

  expect(bounds.overlapping(
    { left: 0, top: 0, width: 10, height: 10 },
    { left: 5, top: 0, width: 10, height: 10 }
  )).toBe(true)

  expect(bounds.overlapping(
    { left: 0, top: 0, width: 10, height: 10 },
    { left: 0, top: 5, width: 10, height: 10 }
  )).toBe(true)
})

function rect(left, top, width, height) {
  return { left, top, width, height }
}