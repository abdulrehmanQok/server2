
import Product from "../model/product.model.js"
import { redis } from "../middleware/redis.js";
import Cloudinary from "../middleware/cloudinary.js";

export const addproduct = async(req,res)=>{
try {
    const product = req.body;
    const {title, price, description, image , category, stock}= product;
    if(!title ||!price ||!description ||!image ||!category ||!stock) return res.status(400).json({message:"All fields are required"});
    const cloudeimage = null;
 if(image){
    cloudeimage = await Cloudinary.uploader.upload(image,{folder:"product"})
 }
 image = cloudeimage?.secure_url 
const newproduct = Product.create({
    title,
    price,
    description,
    image,
    category,
    stock
 });
res.status(201).json({message:"product added successfully",newproduct});
} catch (error) {
    res.status(500).json({message:"error adding product",error});
}
}
 
export const getProduct = async(req , res)=>{
try {
    const detail =  await Product.find()
    res.status(200).json({message:"product details",detail})
} catch (error) {
    res.status(500).json({message:"error getting product details",error})
}
}

export const getbyId = async(req,res)=>{
try {
    const {id} = req.params;
    const detail = await Product.findById(id);
    res.status(200).json({message:"product details",detail})
} catch (error) {
    res.status(500).json({message:"error getting product details",error})
}
}


export const deleteProduct = async(req,res)=>{
    try {
        const product = await Product.findById(req.params.id)
        if(!product) return res.status(404).json({message:"product not found"})
         if(product.image){
            const public_id = product.image.split("/").pop(".")[0]
            try {
                await cloudinary.uploader.destroy(`product/${public_id}`)
                res.json({
                    message:"product image deleted successfully"
                })
            } catch (error) {
                return res.status(500).json({message:"error deleting product image",error})
                
            }
         }     
        await Product.findByIdAndDelete(req.params.id)
        res.status(200).json({message:"product deleted successfully"})
    } catch (error) {
        res.status(500).json({message:"error deleting product",error})
        
    }
}

export const getproductcategory = async(req,res)=>{
    try {
        const {category} = req.params;
        const detail = await Product.find({category})
        res.status(200).json({message:`product in ${category} category`,detail})
    } catch (error) {
        res.status(500).json({message:"error getting product details",error})
    }
}
export const toggleFeaturedProduct = async(req,res)=>{
 try {
    const product = await Product.findById(req.params.id)
    product.isFeatured = !product.isFeatured;
    await product.save();
    await updateFeaturedProductCache();
    res.status(200).json({message:`product status updated successfully`,product})
 } catch (error) {
    res.status(500).json({message:"error updating product status",error})
    
 }
}
async function updateFeaturedProductCache (){
    try {
        const featuredProduct = await Product.find({isFeatured:true}).lean();
        await redis.set("featured_product",JSON.stringify(featuredProduct))
    } catch (error) {
        console.log("error updating featured product cache",error)
        
    }
}
