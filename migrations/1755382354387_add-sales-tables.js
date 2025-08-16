exports.shorthands = undefined;

exports.up = (pgm) => {
  // 1. Create the 'sales' table
  pgm.createTable('sales', {
    id: { type: 'serial', primaryKey: true },
    total_amount: { type: 'decimal(10, 2)', notNull: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  // 2. Create the 'sale_items' table
  pgm.createTable('sale_items', {
    id: { type: 'serial', primaryKey: true },
    // This is a "foreign key" that links this item to a specific sale
    sale_id: {
      type: 'integer',
      notNull: true,
      references: 'sales(id)', // This connects it to the 'id' in the 'sales' table
      onDelete: 'cascade', // If a sale is deleted, its items are also deleted
    },
    // This is another "foreign key" that links to the product
    product_id: {
      type: 'integer',
      notNull: true,
      references: 'products(id)', // Connects to the 'id' in the 'products' table
    },
    quantity: { type: 'integer', notNull: true },
    price_at_sale: { type: 'decimal(10, 2)', notNull: true }, // The price when it was sold
  });
};

exports.down = (pgm) => {
  // When rolling back, we delete the tables in reverse order
  pgm.dropTable('sale_items');
  pgm.dropTable('sales');
};