const unified = require('unified');
const plaintext = require('./plugins/remark-extract-plaintext');

let processor = unified()
	.use(plaintext)
	.use(require('remark-rehype'), {
		allowDangerousHTML: true
	})
	.use(require('rehype-raw'))
	.use(require('@mapbox/rehype-prism'))
	.use(require('rehype-slug'))
	.use(require('rehype-autolink-headings'));

module.exports = processor.run;
