// Libs
const fg = require('fast-glob');
const path = require('path');
const vfile = require('to-vfile');

// Modules
const parse = require('./parse');

module.exports = async cwd => {
	// wait for fast-glob to find our content files...
	let entries = await fg('**/*.md', { cwd });

	// ...then read their contents
	entries = await Promise.all(
		entries.map(filepath => vfile.read(path.join(cwd, filepath), 'utf8'))
	);

	// ...finally parse their content
	return await Promise.all(entries.map(parse));
};
