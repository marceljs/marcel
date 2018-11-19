const fg = require('fast-glob');
const vfile = require('to-vfile');

const supported_extensions = ['js', 'json', 'yaml', 'csv', 'tsv', 'ndtxt'];

const parsers = supported_extensions.reduce((res, ext) => {
	res['.' + ext] = require(`./parse/parse-${ext}`);
	return res;
}, {});

module.exports = async cwd =>
	await Promise.all(
		(await fg(`**/*.{${supported_extensions.join(',')}}`, { cwd })).map(
			path =>
				vfile.read({ path, cwd }, 'utf8').then(async file => {
					if (!parsers[file.extname]) {
						throw new Error(
							`No parser was found for ${file.extname} files`
						);
					} else {
						return await parsers[file.extname](file);
					}
				})
		)
	);
