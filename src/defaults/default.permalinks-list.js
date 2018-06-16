module.exports = function(list, site) {
	if (list !== 'default') {
		return `${list}`;
	}
	return '';
};
