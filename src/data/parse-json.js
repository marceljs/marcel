const fs = require('fs-extra');
const path = require('path');

module.exports = async (entry, base) => {
	let content = await fs.readFile(path.join(base, entry), 'utf8');
	return {
		name: path.basename(entry, path.extname(entry)),
		result: JSON.parse(content)
	};
};
