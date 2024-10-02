import express from 'express';
import dotenv from 'dotenv';
import dbconnection from './config/dbconnection.js';
import routes from './routes/userroutes.js';
import productroutes from './routes/product.js';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import cartroutes from './routes/cartroutes.js';
dotenv.config();

const app = express();
app.use(cors({origin: 'http://localhost:5173',
    credentials:true,limit: "50mb"
}));

app.use(cookieParser());
app.use(express.json());
const port =process.env.PORT || 5000;
dbconnection();
app.use("/api",routes)
app.use("/api",productroutes)
app.use("/api",cartroutes)

app.listen(port , ()=>{
    console.log(`Server is running on port ${port}`)
})

