const nunjucks = require('nunjucks');

module.exports = config => {
	nunjucks.configure(config.templateDir, {
		autoescape: false
	});
	return nunjucks;
};
