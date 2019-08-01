const unified = require('unified');
const frontmatter = require('./plugins/remark-extract-frontmatter');
const smartypants = require('./plugins/remark-smartypants');

let processor = unified()
	.use(require('remark-parse'))
	.use(frontmatter)
	.use(smartypants);

module.exports = file => processor.run(processor.parse(file), file);
