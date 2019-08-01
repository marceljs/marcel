class List {
	constructor(attrs) {
		Object.assign(this, attrs);
	}

	get permalink() {
		// User-supplied permalink.
		// Allow a result of `false` to be returned (= is draft),
		// only go to default on undefined.
		let custom = List.Permalink ? List.Permalink(this) : undefined;
		return custom !== undefined ? custom : List.DefaultPermalink(this);
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

module.exports = List;
