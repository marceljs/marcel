// Libs
const fs = require('fs-extra');
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
		entries.map(filepath =>
			vfile.read(
				{
					path: filepath,
					cwd,
					stats: (stats => ({
						date: new Date(stats.birthtimeMs),
						updated: new Date(stats.mtimeMs)
					}))(fs.statSync(path.resolve(cwd, filepath)))
				},
				'utf8'
			)
		)
	);

	// ...finally parse their content
	return await Promise.all(entries.map(parse));
};
