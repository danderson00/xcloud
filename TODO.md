## Animation

- If previous word could not be placed in first pass,
  - attempt to place using center of previous position
  - if unable, attempt to position using normal center
  - should move words a roughly minimum distance in many cases
  - animating elements as they move in this case should create a really neat effect

## Usability

- Add appropriate exceptions if required options are not correctly specified
  - font size generator (function or { from, to })
  - color generator (function or { r, g, b } or { from: { r, g, b }, to: { r, g, b } })