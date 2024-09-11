import express from 'express';
import { addproduct, getbyId, getProduct } from '../controller/product.controller.js';
import { adminrountes, protectedroutes } from '../middleware/protected.js';

const productroutes = express.Router();

productroutes.route("/product").post(protectedroutes, addproduct)
productroutes.route("/getProduct").get(protectedroutes, getProduct)
productroutes.route("/getbyid/:id").get(protectedroutes,getbyId)

export default productroutes; 