const nunjucks = require('nunjucks');

module.exports = bundler => {
	nunjucks.configure(bundler.config.templateDir, {
		autoescape: false
	});
	return nunjucks;
};
