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

/*
	Adapted from the `mdast-util-to-string` package,
	this function takes a MDAST node and recursively
	stringifies its content. 
 */
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

/*
	Unified plugin that adds the `plaintext` property
	to the file's `data`.
 */
const extract_plaintext = () => (ast, file) => {
	file.data.plaintext = plain(
		// Since strip-markdown modifies the AST,
		// we want to create a copy beforehand
		// just for the purpose of extracting the plain text.
		strip()(map_ast(ast, n => n))
	)
		// Finally, trim any newlines at the beginning/end of the text.
		.replace(/^\n*|\n*$/, '');
};

/*
	An Unified preset for extracting the post's YAML frontmatter
	into the file's `data.frontmatter`. 
 */
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
		.use(extract_plaintext)
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
