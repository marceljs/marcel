const { statSync } = require('fs-extra');
const { resolve } = require('path');

module.exports = file => {
	let stats = statSync(resolve(file.cwd, file.path));
	file.data.stats = {
		date: new Date(stats.birthtimeMs),
		updated: new Date(stats.mtimeMs)
	};
	return file;
};
