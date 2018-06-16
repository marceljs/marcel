/*
	Template hierarchy for lists of posts
 */

module.exports = (list, ext) => {
	let templates = [];
	return templates.concat([`list.${ext}`, `index.${ext}`]);
};
