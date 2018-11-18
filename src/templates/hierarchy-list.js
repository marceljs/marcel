/*
	Template hierarchy for lists of posts
 */

module.exports = (section, ext) => {
	let templates = [];
	if (section !== '__undefined__') {
		templates.push(`list-${section}.${ext}`);
	}
	return templates.concat([`list.${ext}`, `index.${ext}`]);
};
