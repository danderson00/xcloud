const fontSizes = require('./fontSizes')
const colors = require('./colors')
const bounds = require('./bounds')

module.exports = function(words, options) {
    words = words || [];

    let sizeGenerator;
    let colorGenerator;

    const defaults = {
        width: 640,
        height: 480,
        center: { x: 0.5, y: 0.5 },
        steps: 10,
        shape: 'elliptic',
        removeOverflowing: true,
        colors: { r: 34, g: 85, b: 153 },
        fontSize: { from: 0.03, to: 0.07 },
        template: null,
        font: 'Arial'
    };

    let data = {
        outputWords: [],
        timeouts: {},
        step: null,
        angle: null,
        aspectRatio: null,
        maxWeight: null,
        minWeight: null,
        sizes: [],
        colors: []
    };

    initialize();
    drawWordCloud();

    return data.outputWords;

    function initialize() {
        if(!options.measureText || options.measureText.constructor !== Function) {
            throw new Error('You must provide a measureText option!')
        }

        // Default options value
        options = Object.assign({}, defaults, options);

        colorGenerator = colors.createGenerator(options.colors, options.steps)
        sizeGenerator = fontSizes.createGenerator(options.fontSize, options.steps)

        data.angle = Math.random() * 6.28;
        data.step = (options.shape === 'rectangular') ? 18.0 : 2.0;
        data.aspectRatio = options.width / options.height;
    }

    function drawWordCloud() {
        // Make sure every weight is a number before sorting
        words.forEach(word => word.weight = parseFloat(word.weight, 10))

        // Sort words from the word with the highest weight to the one with the lowest
        words.sort((a, b) => b.weight - a.weight);

        // Keep track of bounds
        data.maxWeight = words[0].weight;
        data.minWeight = words[words.length - 1].weight;

        // Generate colors and font sizes
        for (var i = 1; i <= options.steps; i++) {
            data.colors.push(colorGenerator(i));
            data.sizes.push(sizeGenerator(options.width, options.height, i));
        }

        words.forEach((word, index) => drawOneWord(index, word))
    }

    // Function to draw a word, by moving it in spiral until it finds a suitable empty place
    function drawOneWord(index, word) {
        // option.shape == 'elliptic'
        var angle = data.angle,
            radius = 0.0,

        // option.shape == 'rectangular'
            steps_in_direction = 0.0,
            quarter_turns = 0.0,

            weight = Math.floor(options.steps / 2),

            outputWord = {},
            dimensions;

        weight = fontSizes.mapWeightToScale(word.weight, data.minWeight, data.maxWeight, options.steps)

        if (data.colors.length) {
            outputWord.color = data.colors[weight - 1];
        }

        if (data.sizes.length) {
            outputWord.size = data.sizes[weight - 1];
        }

        outputWord.weight = weight;
        outputWord.text = word.text;
        outputWord.font = options.font;
        
        var dimensions = options.measureText(word.text, options.font, outputWord.size)

        outputWord.width = dimensions.width;
        outputWord.height = dimensions.height;
        outputWord.left = options.center.x * options.width - dimensions.width / 2.0;
        outputWord.top = options.center.y * options.height - dimensions.height / 2.0;

        while (bounds.hitTest(outputWord, data.outputWords)) {
            // option shape is 'rectangular' so move the word in a rectangular spiral
            if (options.shape === 'rectangular') {
                steps_in_direction++;

                if (steps_in_direction * data.step > (1 + Math.floor(quarter_turns / 2.0)) * data.step * ((quarter_turns % 4 % 2) === 0 ? 1 : data.aspectRatio)) {
                    steps_in_direction = 0.0;
                    quarter_turns++;
                }

                switch (quarter_turns % 4) {
                    case 1:
                        outputWord.left += data.step * data.aspectRatio + Math.random() * 2.0;
                        break;
                    case 2:
                        outputWord.top -= data.step + Math.random() * 2.0;
                        break;
                    case 3:
                        outputWord.left -= data.step * data.aspectRatio + Math.random() * 2.0;
                        break;
                    case 0:
                        outputWord.top += data.step + Math.random() * 2.0;
                        break;
                }
            }
            // Default settings: elliptic spiral shape
            else {
                radius += data.step;
                angle += (index % 2 === 0 ? 1 : -1) * data.step;

                outputWord.left = options.center.x * options.width - (outputWord.width / 2.0) + (radius * Math.cos(angle)) * data.aspectRatio;
                outputWord.top = options.center.y * options.height + radius * Math.sin(angle) - (outputWord.height / 2.0);
            }
        }

        if (options.removeOverflowing && bounds.outsideContainer(outputWord, options.width, options.height)) {
            return;
        }

        data.outputWords.push(outputWord);
    }
}
