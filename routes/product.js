import express from 'express';
import { addproduct, getbyId, getProduct } from '../controller/product.controller.js';
import { adminrountes, protectedroutes } from '../middleware/protected.js';

const productroutes = express.Router();

productroutes.route("/product").post(protectedroutes, adminrountes, addproduct)
productroutes.route("/getProduct").get(getProduct)
productroutes.route("/getbyid/:id").get(getbyId)

export default productroutes; 