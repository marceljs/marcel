const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

module.exports = async (entry, base) => {
	let content = await fs.readFile(path.join(base, entry), 'utf8');
	return {
		name: path.basename(entry, path.extname(entry)),
		result: yaml.safeLoad(content)
	};
};
