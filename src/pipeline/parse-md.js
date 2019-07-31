const unified = require('unified');
const to_mdast = require('remark-parse');
const mdast_to_hast = require('remark-rehype');
const md_in_html_in_md = require('rehype-raw');
const to_html = require('rehype-stringify');

const frontmatter = require('./unified/remark-extract-frontmatter');
const plaintext = require('./unified/remark-extract-plaintext');
const plugins_for = require('../util/plugins-for');

module.exports = (cfg = {}) => {
	const processor = unified()
		.use(to_mdast)
		.use(plugins_for(cfg, 'onmdast'))
		.use(frontmatter)
		.use(plaintext)
		.use(mdast_to_hast, { allowDangerousHTML: true })
		.use(md_in_html_in_md)
		.use(plugins_for(cfg, 'onhast'))
		.use(to_html);
	return file => processor.process(file);
};
