module.exports = arr =>
	arr.reduce((res, curr) => ((res[curr[0]] = curr[1]), res), {});
