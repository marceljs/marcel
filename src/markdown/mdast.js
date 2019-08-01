const unified = require('unified');
const frontmatter = require('./plugins/remark-extract-frontmatter');

let processor = unified()
	.use(require('remark-parse'))
	.use(frontmatter);

module.exports = file => processor.run(processor.parse(file), file);
