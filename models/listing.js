const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

// Define the image schema first
const imageSchema = new Schema({
    filename: { type: String, required: true },
    url: { type: String, required: true }
});

// Now, define the listing schema
const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        type: imageSchema, // Use the imageSchema for the image field
        default: {
            filename: 'listingimage',
            url: 'https://images.unsplash.com/photo-1619441207978-3d326c46e2c9?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        },
        set: (v) => v === "" ? { filename: "listingimage", url: "https://images.unsplash.com/photo-1619441207978-3d326c46e2c9?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" } : v
    },
    price: Number,
    location: String,
    country: String,
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review",
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});

listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
        await Review.deleteMany({_id:{$in:listing.reviews}});
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
