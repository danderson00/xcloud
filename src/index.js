module.exports = function(words, options) {
    words = words || [];

    let sizeGenerator;
    let colorGenerator;

    const defaults = {
        width: 320,
        height: 180,
        center: { x: 0.5, y: 0.5 },
        steps: 10,
        shape: 'elliptic',
        removeOverflowing: true,
        colors: null,
        fontSize: { from: 0.05, to: 0.10 },
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

        // Create colorGenerator function from options
        if (typeof options.colors == 'function') {
            colorGenerator = options.colors;
        }
        else if (isArray(options.colors)) {
            var cl = options.colors.length;
            if (cl > 0) {
                // Fill the sizes array to X items
                if (cl < options.steps) {
                    for (var i = cl; i < options.steps; i++) {
                        options.colors[i] = options.colors[cl - 1];
                    }
                }

                colorGenerator = function(weight) {
                    return options.colors[options.steps - weight];
                };
            }
        }

        // Create sizeGenerator function from options
        if (typeof options.fontSize == 'function') {
            sizeGenerator = options.fontSize;
        }
        else if (typeof options.fontSize === 'object') {
            sizeGenerator = function(width, height, weight) {
                var max = width * options.fontSize.from,
                    min = width * options.fontSize.to;
                return Math.round(min + (max - min) * 1.0 / (options.steps - 1) * (weight - 1)) + 'px';
            };
        }
        else if (isArray(options.fontSize)) {
            var sl = options.fontSize.length;
            if (sl > 0) {
                // Fill the sizes array to X items
                if (sl < options.steps) {
                    for (var j = sl; j < options.steps; j++) {
                        options.fontSize[j] = options.fontSize[sl - 1];
                    }
                }

                sizeGenerator = function(width, height, weight) {
                    return options.fontSize[options.steps - weight];
                };
            }
        }

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
        if (colorGenerator) {
            for (var i = 0; i < options.steps; i++) {
                data.colors.push(colorGenerator(i + 1));
                data.sizes.push(sizeGenerator(options.width, options.height, i + 1));
            }
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

        // Linearly map the original weight to a discrete scale from 1 to 10, only if weights are different
        if (data.maxWeight != data.minWeight) {
            weight = Math.round((word.weight - data.minWeight) * 1.0 * (options.steps - 1) / (data.maxWeight - data.minWeight)) + 1;
        }

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

        while (hitTest(outputWord)) {
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

        if (options.removeOverflowing && outsideContainer(outputWord)) {
            return;
        }

        data.outputWords.push(outputWord);
    }

    function overlapping(a, b) {
        return (Math.abs(2.0 * a.left + a.width - 2.0 * b.left - b.width) < a.width + b.width) ||
            (Math.abs(2.0 * a.top + a.height - 2.0 * b.top - b.height) < a.height + b.height);
    }

    function hitTest(newWord) {
        return data.outputWords.some(word => overlapping(newWord, word))
    }

    function outsideContainer(word) {
        return (
            word.left < 0 || word.top < 0 ||
            (word.left + word.width) > options.width ||
            (word.top + word.height) > options.height
        )
    }
}

function isArray(target) {
    return target && target.constructor === Array;
}
