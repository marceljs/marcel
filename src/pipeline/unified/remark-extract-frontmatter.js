const visit = require('unist-util-visit');
const frontmatter = require('remark-frontmatter');
const yaml = require('js-yaml');
const toml = require('toml');

/*
	An Unified preset for extracting the post's YAML/TOML/JSON frontmatter
	into the file's `data.frontmatter`. 
 */
module.exports = [
	[
		frontmatter,
		[
			{ type: 'yaml', marker: '-' },
			{ type: 'toml', marker: '+' },
			{ type: 'json', fence: { open: '{', close: '}' } }
		]
	],
	() => (ast, file) => {
		visit(ast, item => {
			if (item.type === 'yaml') {
				file.data.frontmatter = yaml.safeLoad(item.value);
			} else if (item.type === 'toml') {
				file.data.frontmatter = toml(item.value);
			} else if (item.type === 'json') {
				file.data.frontmatter = JSON.parse(`{${item.value}}`);
			}
		});
	}
];
