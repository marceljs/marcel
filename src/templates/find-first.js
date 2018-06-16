const fs = require('fs-extra');
const path = require('path');

module.exports = (templates, base) =>
	templates.find(template => {
		const template_path = path.join(base, template);
		return fs.existsSync(template_path);
	});
