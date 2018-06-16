const csv = require('./parse-csv');
const tsv = require('./parse-tsv');
const json = require('./parse-json');
const yaml = require('./parse-yaml');
const ndtxt = require('./parse-ndtxt');

const path = require('path');

const parsers = {
	'.ndtxt': ndtxt,
	'.json': json,
	'.yaml': yaml,
	'.csv': csv,
	'.tsv': tsv
};

module.exports = async (entries, base) => {
	return Promise.all(
		entries
			.map(entry => {
				let p = parsers[path.extname(entry)];
				if (p) {
					return p(entry, base);
				}
				return null;
			})
			.filter(promise => promise !== null)
	);
};
