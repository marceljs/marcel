/*
	Template hierarchy for single posts
 */

module.exports = post => {
	let templates = [];

	if (post.template) {
		templates.push(post.template);
	}

	if (post.type) {
		if (post.section && post.section !== '__undefined__') {
			templates.push(`single-${post.section}-${post.type}`);
		}
		templates.push(`single-${post.type}`);
	}

	if (post.section && post.section !== '__undefined__') {
		templates.push(`single-${post.section}`);
	}

	return templates.concat([`single`, `index`]);
};
