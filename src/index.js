const fontSizes = require('./fontSizes')
const colors = require('./colors')
const bounds = require('./bounds')

module.exports = function(words, options) {
    if(!options.measureText || options.measureText.constructor !== Function)
        throw new Error('You must provide a measureText option!')

    if(!words || words.length === 0)
        return []

    options = Object.assign({
        width: 640,
        height: 480,
        center: { x: 0.5, y: 0.5 },
        steps: 10,
        shape: 'elliptic',
        removeOverflowing: true,
        colors: { r: 34, g: 85, b: 153 },
        fontSize: { from: 0.02, to: 0.07 },
        font: 'Arial'
    }, options)
    
    let data = {
        outputWords: [],
        step: (options.shape === 'rectangular') ? 18.0 : 2.0,
        angle: Math.random() * 6.28,
        aspectRatio: options.width / options.height,
        maxWeight: null,
        minWeight: null,
        sizes: [],
        colors: []
    }

    let sizeGenerator = fontSizes.createGenerator(options.fontSize, options.steps)
    let colorGenerator = colors.createGenerator(options.colors, options.steps)

    words.forEach(word => word.weight = parseFloat(word.weight, 10))
    words.sort((a, b) => b.weight - a.weight)

    data.maxWeight = words[0].weight
    data.minWeight = words[words.length - 1].weight

    // Generate colors and font sizes
    for (var i = 1; i <= options.steps; i++) {
        data.colors.push(colorGenerator(i))
        data.sizes.push(sizeGenerator(options.width, options.height, i))
    }

    words.forEach((word, index) => drawOneWord(index, word))

    return data.outputWords
    
    // Function to draw a word, by moving it in spiral until it finds a suitable empty place
    function drawOneWord(index, word) {
        // option.shape == 'elliptic'
        let angle = data.angle
        let radius = 0.0

        // option.shape == 'rectangular'
        let steps_in_direction = 0.0
        let quarter_turns = 0.0

        const weight = fontSizes.mapWeightToScale(word.weight, data.minWeight, data.maxWeight, options.steps)
        const dimensions = options.measureText(word.text, options.font, data.sizes[weight - 1])
        
        let outputWord = {
            color: data.colors[weight - 1],
            size: data.sizes[weight - 1],
            weight: weight,
            text: word.text,
            font: options.font,
            width: dimensions.width,
            height: dimensions.height,
            left: options.center.x * options.width - dimensions.width / 2.0,
            top: options.center.y * options.height - dimensions.height / 2.0
        }

        while (bounds.hitTest(outputWord, data.outputWords)) {
            if (options.shape === 'rectangular') {
                steps_in_direction++

                if (steps_in_direction * data.step > (1 + Math.floor(quarter_turns / 2.0)) * data.step * ((quarter_turns % 4 % 2) === 0 ? 1 : data.aspectRatio)) {
                    steps_in_direction = 0.0
                    quarter_turns++
                }

                switch (quarter_turns % 4) {
                    case 1:
                        outputWord.left += data.step * data.aspectRatio + Math.random() * 2.0
                        break
                    case 2:
                        outputWord.top -= data.step + Math.random() * 2.0
                        break
                    case 3:
                        outputWord.left -= data.step * data.aspectRatio + Math.random() * 2.0
                        break
                    case 0:
                        outputWord.top += data.step + Math.random() * 2.0
                        break
                }
            } else {
                radius += data.step
                angle += (index % 2 === 0 ? 1 : -1) * data.step

                outputWord.left = options.center.x * options.width - (outputWord.width / 2.0) + (radius * Math.cos(angle)) * data.aspectRatio
                outputWord.top = options.center.y * options.height + radius * Math.sin(angle) - (outputWord.height / 2.0)
            }
        }

        if (!(options.removeOverflowing && bounds.outsideContainer(outputWord, options.width, options.height)))
            data.outputWords.push(outputWord)
    }
}
