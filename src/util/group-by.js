module.exports = (list, getter) => {
	let groups = {};
	list.forEach(item => {
		let key = getter(item);
		if (!groups[key]) {
			groups[key] = [];
		}
		groups[key].push(item);
	});
	return groups;
};
