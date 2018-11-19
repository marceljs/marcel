const permalinks_single = require('../permalinks-single');

module.exports = config => file => {
	let post = require('../post')(file);
	if (post.permalink === undefined) {
		post.permalink = permalinks_single(post, config);
	}
	return post;
};
