const unified = require('unified');
const parse = require('remark-parse');
const frontmatter = require('remark-frontmatter');
const parseFrontmatter = require('remark-parse-yaml');
const mdToHtml = require('remark-rehype');
const raw = require('rehype-raw');
const html = require('rehype-stringify');
const visit = require('unist-util-visit');
const strip = require('strip-markdown');
const extend = require('extend');
const stringify = require('remark-stringify');

/*
	Unified plugin that adds the `plaintext` property
	to the file's `data`.
 */
const extract_plaintext = () => {
	let processor = unified()
		.use(strip)
		.use(stringify);
	return (ast, file) => {
		file.data.plaintext = processor
			.stringify(processor.runSync(extend(true, {}, ast)))
			// Trim any newlines at the beginning/end of the text.
			.replace(/^\n*|\n*$/, '');
	};
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

	return file => processor.process(file);
};
