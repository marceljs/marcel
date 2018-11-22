const unified = require('unified');
const parse = require('remark-parse');
const frontmatter = require('remark-frontmatter');
const parseFrontmatter = require('remark-parse-yaml');
const mdToHtml = require('remark-rehype');
const raw = require('rehype-raw');
const html = require('rehype-stringify');
const visit = require('unist-util-visit');
const strip = require('strip-markdown');
const map_ast = require('unist-util-map');

const plain = node =>
	node && node.value
		? node.value
		: node.alt
		? node.alt
		: node.title
		? node.title
		: node.children
		? node.children.map(plain).join('\n\n')
		: '';

const extract_plaintext = () => (ast, file) => {
	file.data.plaintext = plain(strip()(map_ast(ast, n => n))).replace(
		/^\n*|\n*$/,
		''
	);
};

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
	let hast_phase_plugins = plugins.map(p => p.onhast).filter(f => f);

	const processor = unified()
		.use(parse)
		.use(extract_frontmatter)
		.use(mdast_phase_plugins)
		.use(mdToHtml, { allowDangerousHTML: true })
		.use(raw)
		.use(hast_phase_plugins)
		.use(html);
	return async file => {
		let parsed = await processor.process(file);
		file.data = {
			...file.data,
			content: parsed.contents
		};
		return file;
	};
};
