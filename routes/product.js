import express from 'express';
import { createProduct, getbyId, getProduct, deleteProduct } from '../controller/product.controller.js';
import { adminroutes, protectedroutes } from '../middleware/protected.js';

const productroutes = express.Router();

productroutes.route("/product").post(createProduct);
productroutes.route("/getProduct").get(getProduct);
productroutes.route("/getbyid/:id").get(protectedroutes, getbyId);
productroutes.route("/delete/:id").delete(deleteProduct); // Add this line for delete functionality

export default productroutes;
