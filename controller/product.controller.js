import Product from "../model/product.model.js"

export const addproduct = async(req,res)=>{
try {
    const product = req.body;
const newproduct = await Product.create(product);
res.status(201).json({message:"product added successfully",newproduct});
} catch (error) {
    res.status(500).json({message:"error adding product",error});
}
}

export const getproducts = async(req,res)=>{
    try {
        const detail = await Product.find();
        res.status(200).json({message:"product get",detail});
    } catch (error) {
        res.status(500).json({message:"error getting products", error});
    }
}

export const getproductById = async(req,res)=>{
    try {
        const detail = await Product.findById(req.params.id);
        if(!detail){
            return res.status(404).json({message:"product not found"});
        }
        res.status(200).json({message:"product get by id",detail});
    } catch (error) {
        res.status(500).json({message:"error getting product by id", error});
    }
}
