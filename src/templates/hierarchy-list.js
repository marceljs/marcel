/*
	Template hierarchy for lists of posts
 */

module.exports = list => {
	let templates = [];

	if (list.taxonomy) {
		if (list.taxonomy === 'section') {
			if (list.term !== '__undefined__') {
				templates.push(`list-${list.term}`);
			}
		} else {
			if (list.term !== undefined) {
				templates.push(`list-${list.taxonomy}-${list.term}`);
			} else {
				templates.push(`list-${list.taxonomy}-index`);
			}
			templates.push(`list-${list.taxonomy}`);
		}
	}

	return templates.concat([`list`, `index`]);
};
