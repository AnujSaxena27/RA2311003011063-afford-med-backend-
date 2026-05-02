const Log = (stack, level, pkg, message) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] [${level.toUpperCase()}] [${pkg}] ${message}`);
};

module.exports = { Log };
