/*
	Template hierarchy for single posts
 */

module.exports = (post, ext) => {
	let templates = [];
	if (post.layout) {
		templates.push(`single-${post.section}-${post.layout}.${ext}`);
		templates.push(`single-${post.layout}.${ext}`);
	}
	if (post.type) {
		templates.push(`single-${post.section}-${post.type}.${ext}`);
		templates.push(`single-${post.type}.${ext}`);
	}
	return templates.concat([`single-${post.section}.${ext}`, `single.${ext}`, `index.${ext}`]);
};
