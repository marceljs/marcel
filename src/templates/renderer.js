const nunjucks = require('nunjucks');

module.exports = config => {
	let env = nunjucks.configure(config.templateDir, {
		autoescape: false
	});
	return env;
};
