import express from 'express'
import { createWarehouse, getWarehouses, updateWarehouse, deleteWarehouse } from '../controllers/warehouseController.js'
import sellerAuth from '../middleware/sellerAuth.js'

const warehouseRouter = express.Router()

warehouseRouter.post('/create', sellerAuth, createWarehouse)
warehouseRouter.get('/list', sellerAuth, getWarehouses)
warehouseRouter.post('/update', sellerAuth, updateWarehouse)
warehouseRouter.post('/delete', sellerAuth, deleteWarehouse)

export default warehouseRouter