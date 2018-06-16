/*
	Template hierarchy for lists of posts
 */

module.exports = (section, ext) => {
	let templates = [];
	if (section !== 'default') {
		templates.push(`list-${section}.${ext}`);
	}
	return templates.concat([`list.${ext}`, `index.${ext}`]);
};
