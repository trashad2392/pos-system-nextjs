// main.js

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const db = require('./src/lib/db').default;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  const loadURL = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, 'out/index.html')}`;
  win.loadURL(loadURL);
  // We will keep this line, but rely on our new logging method for now.
  if (isDev) { win.webContents.openDevTools(); }
}

function setupIpcHandlers() {
  // --- THIS IS THE NEW PART ---
  // Listen for the log message from the preload script and print it.
  ipcMain.on('log', (event, message) => {
    console.log(`[LOG FROM PRELOAD]: ${message}`);
  });

  // --- PRODUCT HANDLERS ---
  ipcMain.handle('get-products', () => db.product.findMany({ where: { is_archived: false }, orderBy: { id: 'asc' } }));
  ipcMain.handle('add-product', (e, d) => db.product.create({ data: d }));
  ipcMain.handle('update-product', (e, id, d) => db.product.update({ where: { id: parseInt(id) }, data: d }));
  ipcMain.handle('delete-product', (e, id) => db.product.update({ where: { id: parseInt(id) }, data: { is_archived: true } }));
  
  // --- SALES HANDLERS ---
  ipcMain.handle('get-sales', async () => {
    const sales = await db.sale.findMany({
      orderBy: { created_at: 'desc' },
      include: { items: { include: { product: true } } },
    });
    return sales.map(s => ({
      sale_id: s.id, total_amount: s.total_amount, created_at: s.created_at,
      items: s.items.map(i => ({ product_name: i.product.name, quantity: i.quantity, price_at_sale: i.price_at_sale })),
    }));
  });
  ipcMain.handle('create-sale', (e, items) => db.$transaction(async (tx) => {
    for (const i of items) {
      await tx.product.update({
        where: { id: i.id, stock_quantity: { gte: i.quantity } },
        data: { stock_quantity: { decrement: i.quantity } },
      });
    }
    const total = items.reduce((t, i) => t + (parseFloat(i.price) * i.quantity), 0);
    return tx.sale.create({
      data: {
        total_amount: total,
        items: { create: items.map(i => ({ product_id: i.id, quantity: i.quantity, price_at_sale: i.price })) },
      },
    });
  }));
}

app.whenReady().then(() => {
  setupIpcHandlers();
  createWindow();
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
