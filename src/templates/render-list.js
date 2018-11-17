const hierarchy = require('./hierarchy-list');
const find_first = require('./find-first');

module.exports = async (renderer, context, config) => {
	let templates = hierarchy(context.posts, config.templateExt);
	let template = find_first(templates, config.templateDir);
	if (template) {
		return new Promise((resolve, reject) => {
			renderer.render(template, context, (err, result) => {
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}
			});
		});
	} else {
		throw new Error('Could not find a matching template');
	}
};
