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
        steps: 10,
        shape: 'elliptic',
        removeOverflowing: true,
        colors: { r: 34, g: 85, b: 153 },
        fontSize: { from: 0.02, to: 0.07 },
        font: 'Arial'
    }, options)
    
    words.forEach(word => word.weight = parseFloat(word.weight, 10))
    words.sort((a, b) => b.weight - a.weight)

    let data = {
        outputWords: [],
        step: (options.shape === 'rectangular') ? 18.0 : 2.0,
        angle: Math.random() * 6.28,
        aspectRatio: options.width / options.height,
        maxWeight: words[0].weight,
        minWeight: words[words.length - 1].weight,
        sizes: fontSizes.generate(options.fontSize, options.steps, options.width, options.height),
        colors: colors.generate(options.colors, options.steps)
    }

    words.forEach((word, index) => layoutWord(index, word))

    return data.outputWords
    
    function layoutWord(index, word) {
        // option.shape == 'elliptic'
        let angle = data.angle
        let radius = 0.0

        // option.shape == 'rectangular'
        let stepsInDirection = 0.0
        let quarterTurns = 0.0

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
            left: options.width / 2.0 - dimensions.width / 2.0,
            top: options.height / 2.0 - dimensions.height / 2.0
        }

        while (bounds.hitTest(outputWord, data.outputWords)) {
            if (options.shape === 'rectangular') {
                stepsInDirection++

                if (stepsInDirection * data.step > (1 + Math.floor(quarterTurns / 2.0)) * data.step * ((quarterTurns % 4 % 2) === 0 ? 1 : data.aspectRatio)) {
                    stepsInDirection = 0.0
                    quarterTurns++
                }

                switch (quarterTurns % 4) {
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
            } else if (options.shape === 'elliptic') {
                radius += data.step
                angle += (index % 2 === 0 ? 1 : -1) * data.step

                outputWord.left = (options.width / 2.0) - (outputWord.width / 2.0) + (radius * Math.cos(angle)) * data.aspectRatio
                outputWord.top = (options.height / 2.0) + radius * Math.sin(angle) - (outputWord.height / 2.0)
            }
        }

        if (!(options.removeOverflowing && bounds.outsideContainer(outputWord, options.width, options.height)))
            data.outputWords.push(outputWord)
    }
}
