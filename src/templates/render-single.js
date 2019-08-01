const find_first = require('./find-first');

module.exports = async (post, renderer, context, config) => {
	let templates = post.templates.map(t => `${t}.${config.templateExt}`);
	let template = find_first(templates, config.templateDir);
	if (template) {
		return new Promise((resolve, reject) => {
			renderer.render(
				template,
				{
					post,
					...context
				},
				(err, result) => {
					if (err) {
						reject(err);
					} else {
						resolve(result);
					}
				}
			);
		});
	} else {
		throw new Error('Could not find a matching template');
	}
};
