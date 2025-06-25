const Listing = require("../models/listing");

module.exports.index = async(req,res)=>{
    const allListings = await Listing.find({});//storing all data in a variable
    res.render("listings/index.ejs",{allListings});//passing data through a variable to render it
};

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing = async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({path: "reviews", populate:{path:"author",},})
    .populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for doesn't exists!");
        res.redirect("/listing");
    }
    res.render("listings/show.ejs",{listing});
};

module.exports.createListing = async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    if (req.file) {
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};


module.exports.renderEditForm = async(req,res,next)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        return next(new ExpressError(404,"Listing not found"));
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250,h_200")
    res.render("listings/edit.ejs",{listing,originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    // Update fields from form
    listing.title = req.body.listing.title;
    listing.description = req.body.listing.description;
    listing.location = req.body.listing.location;
    listing.country = req.body.listing.country;
    listing.price = req.body.listing.price;

    // Only update image if a new file is uploaded
    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    await listing.save();
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};


module.exports.destroyListing = async(req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deletd!");
    res.redirect("/listings");
};