const fg = require('fast-glob');

module.exports = async (patterns, cwd) =>
	(await fg(patterns, { cwd })).map(path => ({ path, cwd }));
