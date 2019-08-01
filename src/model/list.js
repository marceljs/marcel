let { normalize } = require('path');

class List {
	constructor(attrs) {
		Object.assign(this, attrs);
	}

	get permalink() {
		// User-supplied permalink.
		// Allow a result of `false` to be returned (= is draft),
		// only go to default on undefined.
		let custom = List.Permalink ? List.Permalink(this) : undefined;
		return normalize(
			custom !== undefined ? custom : List.DefaultPermalink(this)
		);
	}

	get templates() {
		return List.Hierarchy(this);
	}
}

/*
	Static properties
	-----------------
 */
List.Permalink = undefined;
List.DefaultPermalink = function(list) {
	let tax = list.taxonomy !== 'section' ? list.taxonomy : '';
	if (list.term !== '__undefined__') {
		return `/${tax}/${list.term}`;
	}
	return `/${tax}`;
};

List.Hierarchy = list => {
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

module.exports = List;
