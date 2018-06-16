const fs = require('fs-extra');
const path = require('path');
const { csvParse } = require('d3-dsv');

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

module.exports = async (entry, base) => {
	let content = await fs.readFile(path.join(base, entry), 'utf8');
	return {
		name: path.basename(entry, path.extname(entry)),
		result: csvParse(strip_bom(content))
	};
};
