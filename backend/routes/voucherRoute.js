import express from "express";
import { createVoucher, getVouchers, updateVoucher, deleteVoucher, applyVoucher } from "../controllers/voucherController.js";
import adminAuth from "../middleware/adminAuth.js";

const voucherRouter = express.Router();

voucherRouter.post("/create", adminAuth, createVoucher);
voucherRouter.get("/list", getVouchers);
voucherRouter.put("/update/:id", adminAuth, updateVoucher);
voucherRouter.delete("/delete/:id", adminAuth, deleteVoucher);
voucherRouter.post("/apply", applyVoucher); // User endpoint

export default voucherRouter;
