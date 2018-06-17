const fs = require('fs-extra');
const path = require('path');

const __exists_cache = {};

module.exports = (templates, base) =>
	templates.find(template => {
		if (__exists_cache.hasOwnProperty(template)) {
			return __exists_cache[template];
		}
		const template_path = path.join(base, template);
		return (__exists_cache[template] = fs.existsSync(template_path));
	});
