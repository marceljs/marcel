const permalinks_single = require('../permalinks-single');

module.exports = config => p => {
	let post = require('../post')(p);
	if (post.permalink === undefined) {
		post.permalink = permalinks_single(post, config);
	}
	return post;
};
