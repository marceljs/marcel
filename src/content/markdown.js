const vfile = require('to-vfile');
const remark = require('remark');
const remark_frontmatter = require('remark-frontmatter');
const remark_parse_yaml = require('remark-parse-yaml');
const remark_html = require('remark-html');
const visit = require('unist-util-visit');

const processor = remark()
	.use(remark_frontmatter)
	.use(remark_parse_yaml);

module.exports = async path => {
	let file = vfile.readSync(path, 'utf-8');
	let tree = await processor.run(processor.parse(file));
	visit(tree, 'yaml', res => console.log(res.data.parsedValue));
};
