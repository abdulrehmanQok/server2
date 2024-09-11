import express from 'express';
import { addToCart, clearCart, removeFromCart, updatedCartItems } from '../controller/cart.controller.js';
import { protectedroutes } from '../middleware/protected.js';
const cartroutes = express.Router();

cartroutes.route('/addcart').post(protectedroutes, addToCart);
cartroutes.route("/remove/:id").delete(protectedroutes,removeFromCart);
cartroutes.route("/update/:id").put(protectedroutes,updatedCartItems);
cartroutes.route("/clear").delete(protectedroutes, clearCart);

export default cartroutes;