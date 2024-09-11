import mongoose from "mongoose";
const dbconnection =async ()=>{
    try {
       let res = await mongoose.connect(process.env.DB_Connection);
        console.log(`db connection successfully ${res.connection.host}`)
    } catch (error) {
       console.log(error,"error in mongodb") 
    }
}

export default dbconnection;