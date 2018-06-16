// Libs
const fg = require('fast-glob');
const path = require('path');
const vfile = require('to-vfile');

// Modules
const parse = require('./parse');

module.exports = async cwd => {
	// wait for fast-glob to find our files...
	let files = await fg('**/*.{json,yaml,csv,tsv,ndtxt}', { cwd });

	// ...then read their contents
	files = await Promise.all(files.map(filepath => vfile.read({ path: filepath, cwd }, 'utf8')));

	// ...finally parse their contents
	return files.map(parse);
};
