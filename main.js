// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
// Import the INITIALIZER function, not the client directly
const { initializeDb } = require('./src/lib/db');

let db; // This will hold our database client instance

// This function handles copying the database on the first run
function setupDatabase() {
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'pos.db');
  
  // In development, the resources path is different
  const isDev = require('electron-is-dev');
  const resourcesPath = isDev ? __dirname : process.resourcesPath;
  
  const packagedDbPath = path.join(resourcesPath, 'prisma', 'dev.db');

  if (!fs.existsSync(dbPath)) {
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    fs.copyFileSync(packagedDbPath, dbPath);
    console.log('Database copied to user data directory.');
  }
}

function createWindow() {
  const isDev = require('electron-is-dev');
  const win = new BrowserWindow({
    width: 1200, height: 800,
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
  });
  const loadURL = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, 'out/index.html')}`;
  win.loadURL(loadURL);
  if (isDev) { win.webContents.openDevTools(); }
}

// This helper function safely converts Prisma's Decimal objects to strings
const sanitizeDecimals = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj.constructor.name === 'Decimal') return obj.toFixed(2);
  if (Array.isArray(obj)) return obj.map(sanitizeDecimals);
  const newObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = sanitizeDecimals(obj[key]);
    }
  }
  return newObj;
};

function setupIpcHandlers() {
  ipcMain.handle('get-products', async () => sanitizeDecimals(await db.product.findMany({ where: { is_archived: false }, orderBy: { id: 'asc' } })));
  ipcMain.handle('add-product', async (e, d) => sanitizeDecimals(await db.product.create({ data: d })));
  ipcMain.handle('update-product', async (e, id, d) => sanitizeDecimals(await db.product.update({ where: { id: parseInt(id) }, data: d })));
  ipcMain.handle('delete-product', async (e, id) => sanitizeDecimals(await db.product.update({ where: { id: parseInt(id) }, data: { is_archived: true } })));
  ipcMain.handle('get-sales', async () => sanitizeDecimals(await db.sale.findMany({ orderBy: { created_at: 'desc' }, include: { items: { include: { product: true } } } })));
  ipcMain.handle('create-sale', async (e, items) => {
    const sale = await db.$transaction(async (tx) => {
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
    });
    return sanitizeDecimals(sale);
  });
}

app.whenReady().then(() => {
  // --- THIS IS THE FIX ---
  // We initialize the database client AFTER the app is ready.
  db = initializeDb();
  
  setupDatabase();
  setupIpcHandlers();
  createWindow();
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });