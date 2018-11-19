const fs = require('fs-extra');
const path = require('path');

module.exports = file => {
	file.stats = (stats => ({
		date: new Date(stats.birthtimeMs),
		updated: new Date(stats.mtimeMs)
	}))(fs.statSync(path.resolve(file.cwd, file.path)));
	return file;
};
