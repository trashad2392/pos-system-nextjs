// preload.js

const { contextBridge, ipcRenderer } = require('electron');

// --- THIS IS THE NEW PART ---
// Send a message to the main process to prove this script is running.
ipcRenderer.send('log', '--- PRELOAD SCRIPT IS RUNNING ---');

contextBridge.exposeInMainWorld('api', {
  getProducts: () => ipcRenderer.invoke('get-products'),
  addProduct: (productData) => ipcRenderer.invoke('add-product', productData),
  updateProduct: (id, productData) => ipcRenderer.invoke('update-product', id, productData),
  deleteProduct: (id) => ipcRenderer.invoke('delete-product', id),
  createSale: (cartItems) => ipcRenderer.invoke('create-sale', cartItems),
  getSales: () => ipcRenderer.invoke('get-sales'),
});
