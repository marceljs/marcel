const fs = require('fs-extra');
const fg = require('fast-glob');
const path = require('path');
const vfile = require('to-vfile');
const parse = require('../parse/parse-md');

module.exports = async cwd =>
	await Promise.all(
		(await fg('**/*.md', { cwd })).map(filepath =>
			vfile
				.read(
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
				.then(parse)
		)
	);
