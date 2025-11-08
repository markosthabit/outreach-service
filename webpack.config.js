module.exports = (options, webpack) => {
  return {
    ...options,
    optimization: {
      minimize: true,
      usedExports: true,
    },
    externals: {
      // Don't bundle these, they'll be in node_modules
      'class-transformer': 'commonjs class-transformer',
      'class-validator': 'commonjs class-validator',
    },
  };
};