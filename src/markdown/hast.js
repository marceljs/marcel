const unified = require('unified');
const plaintext = require('./plugins/remark-extract-plaintext');
const taskitem_slug = require('./plugins/remark-taskitem-slug');

module.exports = options => {
	let processor = unified()
		.use(plaintext)
		.use(taskitem_slug)
		.use(require('remark-rehype'), {
			allowDangerousHTML: true
		})
		.use(require('rehype-raw'));

	if (options.highlight) {
		processor = processor.use(
			require('@mapbox/rehype-prism'),
			options.highlight === true ? {} : options.highlight
		);
	}

	if (options.headerlinks) {
		processor = processor
			.use(require('rehype-slug'))
			.use(
				require('rehype-autolink-headings'),
				options.headerlinks === true ? {} : options.headerlinks
			);
	}

	return processor.run;
};
