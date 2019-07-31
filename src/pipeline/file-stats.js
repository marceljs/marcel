const fs = require('fs-extra');
const path = require('path');

module.exports = file => {
	let stats = fs.statSync(path.resolve(file.cwd, file.path));
	file.data.stats = {
		date: new Date(stats.birthtimeMs),
		updated: new Date(stats.mtimeMs)
	};
	return file;
};
