const unified = require('unified');
const frontmatter = require('./plugins/remark-extract-frontmatter');
const smartypants = require('./plugins/remark-smartypants');

module.exports = options => {
	let processor = unified()
		.use(require('remark-parse'))
		.use(frontmatter);

	if (options.smartypants) {
		processor = processor.use(
			smartypants,
			options.smartypants === true ? {} : options.smartypants
		);
	}

	return file => processor.run(processor.parse(file), file);
};
