module.exports = distDir =>
	`
---
Configuration error!
distDir: ${distDir} is outside the current working directory.
To avoid deleting things accidentally due to misconfiguration,
such a path is not currently supported, sorry.
---
`;
