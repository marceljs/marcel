const unified = require('unified');
const parse = require('remark-parse');
const frontmatter = require('remark-frontmatter');
const parseFrontmatter = require('remark-parse-yaml');
const mdToHtml = require('remark-rehype');
const html = require('rehype-stringify');
const visit = require('unist-util-visit');

const processor = unified()
	.use(parse)
	.use(frontmatter)
	.use(parseFrontmatter)
	.use(() => (ast, file) => {
		visit(ast, 'yaml', item => {
			file.data.frontmatter = item.data.parsedValue;
		});
	})
	.use(mdToHtml)
	.use(html);

module.exports = async file => {
	let parsed = await processor.process(file);
	file.data = {
		...file.data,
		content: parsed.contents
	};
	return file;
};
