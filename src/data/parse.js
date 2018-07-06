const yaml = require('js-yaml');
const { csvParse, tsvParse } = require('d3-dsv');

/*
	From here: https://github.com/d3/d3-dsv

	Byte-Order Marks
	----------------
	DSV files sometimes begin with a byte order mark (BOM); 
	saving a spreadsheet in CSV UTF-8 format from Microsoft Excel, 
	for example, will include a BOM. On the web this is not usually 
	a problem because the UTF-8 decode algorithm specified in the 
	Encoding standard removes the BOM. Node.js, on the other hand, 
	does not remove the BOM when decoding UTF-8.
*/

const strip_bom = require('strip-bom');

const parsers = {
	'.ndtxt': content => content.split(/\n/),
	'.json': content => JSON.parse(content),
	'.yaml': content => yaml.safeLoad(content),
	'.csv': content => csvParse(strip_bom(content)),
	'.tsv': content => tsvParse(strip_bom(content))
};

module.exports = file => {
	let parser = parsers[file.extname];
	if (parser) {
		file.data = parser(file.contents);
	} else {
		throw new Error('Could not find appropriate parser for file.');
	}
	return file;
};
