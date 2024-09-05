import express from 'express';
import { product } from './data.js';
import dotenv from 'dotenv';
import dbconnection from './config/dbconnection.js';
import routes from './routes/userroutes.js';
import productroutes from './routes/product.js';
import cookieParser from 'cookie-parser';
import cors from 'cors'

dotenv.config();

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());
const port =process.env.PORT || 5000;
dbconnection();
app.use("/api",routes)
app.use("/",productroutes)
// app.get('/product',(req,res)=>{
// res.send(product)
// })
app.listen(port , ()=>{
    console.log(`Server is running on port ${port}`)
})

