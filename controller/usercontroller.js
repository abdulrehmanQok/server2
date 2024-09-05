import User from "../model/usermodel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import { redis } from "../middleware/redis.js";
// import cookie from "cookie"

const generatetoken =(userid)=>{
   const accesstoken = jwt.sign({userid},process.env.secretkey1,{
    expiresIn:'15m'
   }) 
   const refreshtoken = jwt.sign({userid},process.env.secretkey,{
    expiresIn:'7d'
   })
   return {accesstoken,refreshtoken}
}
const storetoken = async(userid, refreshtoken)=>{
await  redis.set(`refreshtoken ${userid}`,refreshtoken)
}
const setCookies = (res, accesstoken, refreshtoken) => {
    res.cookie("accesstoken", accesstoken, {
        httpOnly: true,
        secure: process.env.Node_env === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    });
    res.cookie("refreshtoken", refreshtoken, {
        httpOnly: true,
        secure: process.env.Node_env === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000 // 15 minutes in milliseconds
    });
};

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Hash the password
        const hashpassword = await bcrypt.hash(password, 10);

        // Create the user
        const user = await User.create({
            name,
            email,
            password: hashpassword
        });

        // Generate tokens
        const { accesstoken, refreshtoken } = generatetoken(user._id);
         // Generate tokens
         const { accesstoken, refreshtoken } = generatetoken(user._id);

        // Set cookies
        setCookies(res, accesstoken, refreshtoken);
        await storetoken(user._id , refreshtoken)
        // Respond with success message
        res.status(200).json({
            message: "User created successfully",
            user,
       accesstoken,
        refreshtoken
        });
    } catch (error) {
        res.status(500).json({
            message: "Error while registering",
            error
        });
    }
};
export const GetUser = async(req,res)=>{
try {
    const detail = await User.find();
res.status(200).json({
    message:"user details",
    detail
})
} catch (error) {
   res.status(500).json({
    message:"error getting user details",
    error
   }) 
}
}

export const UpdateUser = async(req,res)=>{
try {
    const {id} = req.params;
    const updateinfo = req.body;
    const updatedetail =await User.findByIdAndUpdate(id,updateinfo);
    res.status(200).json({
        message:"user details updated successfully",
        updatedetail
    })
} catch (error) {
    res.status(500).json({
    message:"error updating user details",
    error
   })
    
}
}

export const DeleteUser = async(req,res)=>{
try {
    const {id} = req.params;
    const deleteuser = await User.findByIdAndDelete(id);
    res.status(200).json({
        message:"user deleted successfully",
        deleteuser
    })
} catch (error) {
    res.status(500).json({
        message:"error deleting user",
        error
    })
}
}

export const login = async(req,res)=>{
try {
    const user = req.body;
    const {email, password} = user;
    const userExist = await User.findOne({email});
    if(!userExist){
        return res.status(401).json({
            message:"User not found"
        })
    }
    const isMatch = await bcrypt.compare(password,userExist.password)
    if(!isMatch){
        return res.status(401).json({
            message:"invalid credential"
        })
    }
    // Set cookies
    // setCookies(res, accesstoken, refreshtoken);
    res.status(200).json({
        message:"User logged in successfully",
        user:userExist
    })
} catch (error) {
    res.status(401).json({
        message:"error logging in user",
        error
    })
}
}

// export const refreshToken = async(req,res)=>{
//     const refrestoken = req.cookie.refreshToken;
//     if(!refreshToken){
//         return res.status(403).json({
//             message:"No refresh token provided"
//         })
//     }
//     const deocode = jwt.verify({userid},process.env.secretkey,{
//         expiresIn:'7d'
//     })
// }
