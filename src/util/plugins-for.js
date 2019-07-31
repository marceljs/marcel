module.exports = (cfg, method) =>
	(cfg.plugins || []).map(p => p[method]).filter(f => f);
