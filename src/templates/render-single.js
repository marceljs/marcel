const find_first = require('./find-first');
const { promisify } = require('util');

module.exports = (post, renderer, context, config) => {
	let templates = post.templates.map(t => `${t}.${config.templateExt}`);
	let template = find_first(templates, config.templateDir);
	let render_fn;
	if (template) {
		render_fn = promisify(renderer.render.bind(renderer));
	} else {
		// todo show warning
		template = '{{ post.content }}';
		render_fn = promisify(renderer.renderString.bind(renderer));
	}
	return render_fn(template, {
		post,
		...context
	});
};
