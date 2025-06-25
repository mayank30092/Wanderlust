if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;

// Connect to MongoDB
main()
    .then(() => {
        console.log("Connected to Db");
    })
    .catch((err) => console.log(err));

async function main() {
    await mongoose.connect(dbUrl);
}

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// Session Store
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", () => {
    console.log("Error in MONGO SESSION STORE", err);
});

// Session options
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

// ✅ Correct middleware order below

app.use(session(sessionOptions));      // Session first
app.use(flash());                      // Then flash
app.use(passport.initialize());        // Then passport
app.use(passport.session());           // Then passport session

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ✅ Set local variables AFTER session, flash, passport
app.use((req, res, next) => {
    res.locals.success = req.flash("success") || "";
    res.locals.error = req.flash("error") || "";
    res.locals.currUser = req.user || null;
    res.locals.mapKey = process.env.MAP_TOKEN || "";
    next();
});

// Routes
app.get("/", (req, res) => {
    res.render("index");
});

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

// Error handler
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went Wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
