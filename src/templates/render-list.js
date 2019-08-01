const find_first = require('./find-first');

module.exports = async (list, renderer, context, config) => {
	let templates = list.templates.map(t => `${t}.${config.templateExt}`);
	let template = find_first(templates, config.templateDir);
	if (template) {
		return new Promise((resolve, reject) => {
			renderer.render(
				template,
				{
					posts: list.posts || [],
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
