const slugify = require('@sindresorhus/slugify');
const nodePath = require('path');

const strip_filename_prefix = require('../util/strip-filename-prefix');

module.exports = function(attrs) {
	let { file, data, content } = attrs;

	let res = {
		...file.stats,
		...data,
		data: data,
		stats: file.stats,
		content: content,
		title_slug: data.title ? slugify(data.title) : undefined,
		path: file.path,
		directory: file.dirname,
		filename: file.stem,
		filename_slug:
			slugify(strip_filename_prefix(file.stem)) || slugify(file.stem),
		section: file.dirname.split(nodePath.sep)[0]
	};

	if (res.section === '.') {
		res.section = '__undefined__';
	}

	return res;
};
