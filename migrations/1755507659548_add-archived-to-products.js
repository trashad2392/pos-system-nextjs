exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumn('products', {
    is_archived: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('products', 'is_archived');
};