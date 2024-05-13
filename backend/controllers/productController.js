const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const { fileSizeFormatter } = require('../utils/fileUpload');
const cloudinary = require('cloudinary').v2;

// CREATE product
const createProduct = asyncHandler( async (req, res) => {
     const {name, sku, category, quantity, price, description} = req.body;

     // Validation
     if (!name || !category || !quantity || !price || !description) {
        res.status(400);
        throw new Error("Please fill all fields")
     }
     
     // Handle image upload
     let fileData = {}
     if (req.file) {
        // save image to cloudinary
        let uploadedFile;
        try {
            uploadedFile = await cloudinary.uploader.upload(req.file.path, {folder: "Obero Invent App", resource_type: "image"})
        } catch (error) {
            res.status(500);
            throw new Error("Image could not be uploaded");
        }
        fileData = {
            fileName: req.file.originalname,
            filePath: uploadedFile.secure_url,      // url or image in cloudinary
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter(req.file.size, 2)
        }
     }

     // Create product in db
     const product = await Product.create({
        user: req.user.id,
        name, 
        sku,
        category,
        quantity,
        price,
        description,
        image: fileData
     })
     res.status(201).json(product);
})

// GET all product
const getProducts = asyncHandler( async (req, res) => {
    const products = await Product.find({user: req.user.id}).sort("-createdAt");
    res.status(200).json(products);
})

// GET single product
const getProduct = asyncHandler( async (req, res) => {
    const product = await Product.findById(req.params.id);  // find by product id

    // if product !exist
    if (!product) {
        res.status(404)
        throw new Error("Product not found");
    }

    // match product to its user
    if (product.user.toString() !== req.user.id) {
        res.status(401)
        throw new Error("Unauthorized user");
    }

    res.status(200).json(product);
})

// DELETE product 
const deleteProduct = asyncHandler( async (req, res) => {
    const product = await Product.findById(req.params.id);  // find by product id

    // if product !exist
    if (!product) {
        res.status(404)
        throw new Error("Product not found");
    }

    // match product to its user
    if (product.user.toString() !== req.user.id) {
        res.status(401)
        throw new Error("Unauthorized user action");
    }
    await product.deleteOne();
    res.status(200).json({message: "Product deleted"});
})

// UPDATE product 
const updateProduct = asyncHandler( async (req, res) => {
    const {name, category, quantity, price, description} = req.body;
    const {id} = req.params       // id parameter in url
    const product = await Product.findById(id)       // get product by id
    
    // if product !exist
    if (!product) {
        res.status(404)
        throw new Error("Product not found");
    }

    // match product to its user 
    if (product.user.toString() !== req.user.id) {
        res.status(404);
        throw new Error("Unauthorized user action");
    }

    // Handle image upload
    let fileData = {}
    if (req.file) {
       // save image to cloudinary
       let uploadedFile;
       try {
           uploadedFile = await cloudinary.uploader.upload(req.file.path, {folder: "Obero Invent App", resource_type: "image"})
       } catch (error) {
           res.status(500);
           throw new Error("Image could not be uploaded");
       }
       fileData = {
           fileName: req.file.originalname,
           filePath: uploadedFile.secure_url,      // url or image in cloudinary
           fileType: req.file.mimetype,
           fileSize: fileSizeFormatter(req.file.size, 2)
       }
    }

    // Update the product in db
    const updatedProduct = await Product.findByIdAndUpdate(
        {_id: id}, 
        {
            name, 
            category,
            quantity,
            price,
            description,
            // If filedata has nothing in it (i.e no image selected), use old image else use new image
            image: Object.keys(fileData).length === 0 ? product?.image : fileData     
        },
        {
            new: true,              // signifies new modification thus
            runValidators: true      // validate details using product model field values e.g required: true 
        }
    )
    res.status(201).json(updatedProduct);
})

module.exports = {
    createProduct,
    getProducts,
    getProduct,
    deleteProduct, 
    updateProduct
}