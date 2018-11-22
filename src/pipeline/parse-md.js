const unified = require('unified');
const parse = require('remark-parse');
const frontmatter = require('remark-frontmatter');
const parseFrontmatter = require('remark-parse-yaml');
const mdToHtml = require('remark-rehype');
const raw = require('rehype-raw');
const html = require('rehype-stringify');
const visit = require('unist-util-visit');

const extract_frontmatter = [
	frontmatter,
	parseFrontmatter,
	() => (ast, file) => {
		visit(ast, 'yaml', item => {
			file.data.frontmatter = item.data.parsedValue;
		});
	}
];

module.exports = (cfg = {}) => {
	let plugins = cfg.plugins || [];

	let mdast_phase_plugins = plugins.map(p => p.onmdast).filter(f => f);

	const processor = unified()
		.use(parse)
		.use(extract_frontmatter)
		.use(mdast_phase_plugins)
		.use(mdToHtml, { allowDangerousHTML: true })
		.use(raw)
		.use(html);
	return async file => {
		let parsed = await processor.process(file);
		file.data = {
			...file.data,
			content: parsed.contents
		};
		console.log(file.data);
		return file;
	};
};
