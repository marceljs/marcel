module.exports = function(list, config) {
	let tax = list.taxonomy !== 'section' ? list.taxonomy : '';
	if (list.term !== '__undefined__') {
		return `/${tax}/${list.term}`;
	}
	return `/${tax}`;
};
