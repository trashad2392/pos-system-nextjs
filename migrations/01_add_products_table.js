exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('products', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    sku: { type: 'varchar(100)', notNull: true, unique: true },
    price: { type: 'decimal(10, 2)', notNull: true },
    stock_quantity: { type: 'integer', notNull: true, default: 0 },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('products');
};