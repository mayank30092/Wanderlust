const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");//schema of mongo db
const {isLoggedIn, isOwner, validateListing,storeReturnTo} = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});

router
    .route("/")
    .get(wrapAsync(listingController.index))//index route
    .post(
        isLoggedIn,
        validateListing,
        upload.single('listing[image]'),
        wrapAsync(listingController.createListing)
    );// create route

//new route
router.get("/new",isLoggedIn,listingController.renderNewForm);

router
    .route("/:id")
    .get(storeReturnTo, wrapAsync(listingController.showListing))//show route
    .put(
        isLoggedIn,
        isOwner,
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingController.updateListing))//update route
    .delete(
        isLoggedIn,
        isOwner,
        wrapAsync(listingController.destroyListing));

//Edit Route
router.get("/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditForm));

module.exports = router;