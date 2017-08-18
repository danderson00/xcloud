## Animation

First pass
- Iterate from largest to smallest
- If word was not previously rendered, delay to third pass
- If word was previously rendered, attempt to render in the same location
  - If unable to render, delay to second pass
Second pass
- Iterate remaining previously rendered words from largest to smallest
  - (?) Use center of previous location to render as close as possible to previous location
Third pass
- Iterate new words from largest to smallest

## Usability

- Add appropriate exceptions if required options are not correctly specified
  - font size generator (function or { from, to })
  - color generator (function or { r, g, b } or { from: { r, g, b }, to: { r, g, b } })