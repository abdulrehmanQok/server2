import Stripe from 'stripe';
import dotenv from "dotenv";
dotenv.config();
// Use the secret key for your live or test account
 export const stripe = new Stripe(process.env.STRIPESECKRET);

 