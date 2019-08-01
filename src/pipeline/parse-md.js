const unified = require('unified');

const frontmatter = require('./unified/remark-extract-frontmatter');
const plaintext = require('./unified/remark-extract-plaintext');

let one = unified()
	.use(require('remark-parse'))
	.use(frontmatter);

let two = unified()
	.use(plaintext)
	.use(require('remark-rehype'), {
		allowDangerousHTML: true
	})
	.use(require('rehype-raw'))
	.use(require('@mapbox/rehype-prism'));

let three = unified().use(require('rehype-stringify'));

module.exports = {
	mdast: file => one.run(one.parse(file), file),
	hast: two.run,
	html: three.stringify
};
