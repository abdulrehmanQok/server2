import express from 'express';
import { addproduct, getproductById, getproducts } from '../controller/product.controller.js';

const productroutes = express.Router();

productroutes.route("/product").post(addproduct)
productroutes.route("/getproduct").get(getproducts)
productroutes.route("/getbyid/:id").get(getproductById)


export default productroutes;