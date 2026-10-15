import express from 'express';
import { createInventory, getInventory, importStock, adjustInventory, getProductStock } from '../controllers/inventoryController.js';
import sellerAuth from '../middleware/sellerAuth.js';
const inventoryRouter = express.Router();

inventoryRouter.post('/create', sellerAuth, createInventory);
inventoryRouter.get('/', sellerAuth, getInventory);
inventoryRouter.post('/import', sellerAuth, importStock);
inventoryRouter.post('/adjust', sellerAuth, adjustInventory);
inventoryRouter.get('/stock/:productId', getProductStock);

export default inventoryRouter;
