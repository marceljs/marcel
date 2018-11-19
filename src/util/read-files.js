const fg = require('fast-glob');
const vfile = require('to-vfile');

module.exports = async (patterns, cwd) =>
	await Promise.all(
		(await fg(patterns, { cwd })).map(path =>
			vfile.read({ path, cwd }, 'utf8')
		)
	);
