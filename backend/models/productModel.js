const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user",
    },
    name: {
        type: String,
        required: [true, "Please add a name"],
        trim: true          // trim white spaces
    },
    sku: {                  // to be generated on frontend
        type: String,
        required: true,
        default: "SKU",
        trim: true
    },
    category: {
        type: String,
        required: [true, "Please add a category"],
        trim: true
    },
    quantity: {
        type: String,
        required: [true, "Please add a quantity"],
        trim: true
    },
    price: {
        type: String,
        required: [true, "Please add a price"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Please add a quantity"],
        trim: true
    },
    image: {
        type: Object,
        default: {}
    },

}, {
    timestamps: true,
})

const Product = mongoose.model("Product", productSchema);
module.exports = Product;