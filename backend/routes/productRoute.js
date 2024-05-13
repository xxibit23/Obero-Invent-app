const express = require('express');
const router = express.Router();
const protect = require('../middleWare/authMiddleware');
const { createProduct, getProducts, getProduct, deleteProduct, updateProduct } = require('../controllers/productController');
const { upload } = require('../utils/fileUpload');

router.post("/", protect, upload.single("image"), createProduct);   // router to upload a single file
router.patch("/:id", protect, upload.single("image"), updateProduct);   // router to upload a single file
router.get("/", protect, getProducts);  
router.get("/:id", protect, getProduct);       // get single product based on its id as parameter
router.delete("/:id", protect, deleteProduct);       // delete product from db based on its id as parameter


module.exports = router;