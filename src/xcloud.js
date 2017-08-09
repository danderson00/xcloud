module.exports = function(words, options) {
    words = words || [];

    let sizeGenerator = null;
    let colorGenerator = null;

    const defaults = {
        width: 100,
        height: 100,
        center: { x: 0.5, y: 0.5 },
        steps: 10,
        shape: 'elliptic',
        classPattern: 'w{n}',
        encodeURI: true,
        removeOverflowing: true,
        afterCloudRender: null,
        colors: null,
        fontSize: null,
        template: null
    };

    let data = {
        placed_words: [],
        timeouts: {},
        step: null,
        angle: null,
        aspect_ratio: null,
        max_weight: null,
        min_weight: null,
        sizes: [],
        colors: []
    };

    initialize();
    drawWordCloud();

    return data.placed_words;

    function initialize() {
        if(!options.measureText || options.measureText.constructor !== Function) {
            throw new Error('You must provide a measureText option!')
        }

        // Default options value
        options = Object.assign({}, defaults, options);

        // Backward compatibility
        if (options.center.x > 1) {
            options.center.x = options.center.x / options.width;
            options.center.y = options.center.y / options.height;
        }

        // Create colorGenerator function from options
        // Direct function
        if (typeof options.colors == 'function') {
            colorGenerator = options.colors;
        }
        // Array of sizes
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
        // Direct function
        if (typeof options.fontSize == 'function') {
            sizeGenerator = options.fontSize;
        }
        // Object with 'from' and 'to'
        else if (isPlainObject(options.fontSize)) {
            sizeGenerator = function(width, height, weight) {
                var max = width * options.fontSize.from,
                    min = width * options.fontSize.to;
                return Math.round(min + (max - min) * 1.0 / (options.steps - 1) * (weight - 1)) + 'px';
            };
        }
        // Array of sizes
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
        data.aspect_ratio = options.width / options.height;
    }

    // Pairwise overlap detection
    function overlapping(a, b) {
        if (Math.abs(2.0 * a.left + a.width - 2.0 * b.left - b.width) < a.width + b.width) {
            if (Math.abs(2.0 * a.top + a.height - 2.0 * b.top - b.height) < a.height + b.height) {
                return true;
            }
        }
        return false;
    }

    // Helper function to test if an element overlaps others
    function hitTest(elem) {
        // Check elements for overlap one by one, stop and return false as soon as an overlap is found
        for (var i = 0, l = data.placed_words.length; i < l; i++) {
            if (overlapping(elem, data.placed_words[i])) {
                return true;
            }
        }
        return false;
    }

    // Initialize the drawing of the whole cloud
    function drawWordCloud() {
        var i, l;

        if (words.length === 0) {
            return;
        }

        // Make sure every weight is a number before sorting
        for (i = 0, l = words.length; i < l; i++) {
            words[i].weight = parseFloat(words[i].weight, 10);
        }

        // Sort words from the word with the highest weight to the one with the lowest
        words.sort(function(a, b) {
            return b.weight - a.weight;
        });

        // Kepp trace of bounds
        data.max_weight = words[0].weight;
        data.min_weight = words[words.length - 1].weight;

        // Generate colors
        data.colors = [];
        if (colorGenerator) {
            for (i = 0; i < options.steps; i++) {
                data.colors.push(colorGenerator(i + 1));
            }
        }

        // Generate font sizes
        data.sizes = [];
        if (sizeGenerator) {
            for (i = 0; i < options.steps; i++) {
                data.sizes.push(sizeGenerator(options.width, options.height, i + 1));
            }
        }

        for (i = 0, l = words.length; i < l; i++) {
            drawOneWord(i, words[i]);
        }

        if (typeof options.afterCloudRender === 'function') {
            options.afterCloudRender();
        }
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

            outputWord,
            dimensions;

        // Linearly map the original weight to a discrete scale from 1 to 10
        // Only if weights are different
        if (data.max_weight != data.min_weight) {
            weight = Math.round((word.weight - data.min_weight) * 1.0 * (options.steps - 1) / (data.max_weight - data.min_weight)) + 1;
        }

        outputWord.weight = weight;

        // Apply color
        if (data.colors.length) {
            outputWord.color = data.colors[weight - 1];
        }

        // Apply size
        if (data.sizes.length) {
            outputWord.size = data.sizes[weight - 1];
        }

        outputWord.text = word.text;

        var dimensions = options.measureText(word.text)

        outputWord.width = dimensions.width;
        outputWord.height = dimensions.height;

        outputWord.left = options.center.x * options.width - dimensions.width / 2.0;
        outputWord.top = options.center.y * options.height - dimensions.height / 2.0;

        while (hitTest(outputWord)) {
            // option shape is 'rectangular' so move the word in a rectangular spiral
            if (options.shape === 'rectangular') {
                steps_in_direction++;

                if (steps_in_direction * data.step > (1 + Math.floor(quarter_turns / 2.0)) * data.step * ((quarter_turns % 4 % 2) === 0 ? 1 : data.aspect_ratio)) {
                    steps_in_direction = 0.0;
                    quarter_turns++;
                }

                switch (quarter_turns % 4) {
                    case 1:
                        outputWord.left += data.step * data.aspect_ratio + Math.random() * 2.0;
                        break;
                    case 2:
                        outputWord.top -= data.step + Math.random() * 2.0;
                        break;
                    case 3:
                        outputWord.left -= data.step * data.aspect_ratio + Math.random() * 2.0;
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

                outputWord.left = options.center.x * options.width - (outputWord.width / 2.0) + (radius * Math.cos(angle)) * data.aspect_ratio;
                outputWord.top = options.center.y * options.height + radius * Math.sin(angle) - (outputWord.height / 2.0);
            }
        }

        // Don't render word if part of it would be outside the container
        if (options.removeOverflowing && (
                outputWord.left < 0 || outputWord.top < 0 ||
                (outputWord.left + outputWord.width) > options.width ||
                (outputWord.top + outputWord.height) > options.height
            )
        ) {
            return;
        }

        // Save position for further usage
        data.placed_words.push(outputWord);
    }
};

function isArray(target) {
    return target && target.constructor === Array;
}

function isPlainObject(target) {
    return typeof target === 'object';
}