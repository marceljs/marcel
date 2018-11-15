/*
	Template hierarchy for single posts
 */

module.exports = (post, ext) => {
	let templates = [];
	if (post.type) {
		if (post.section !== 'default') {
			templates.push(`single-${post.section}-${post.type}.${ext}`);
		}
		templates.push(`single-${post.type}.${ext}`);
	}
	return templates.concat([
		`single-${post.section}.${ext}`,
		`single.${ext}`,
		`index.${ext}`
	]);
};
