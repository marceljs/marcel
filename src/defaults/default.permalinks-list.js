module.exports = function(list) {
	if (list !== 'default') {
		return `/${list}`;
	}
	return '';
};
