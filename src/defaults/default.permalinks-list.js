module.exports = function(list) {
	if (list !== '__undefined__') {
		return `/${list}`;
	}
	return '';
};
