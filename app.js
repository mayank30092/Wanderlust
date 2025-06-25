if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");//for get post methods
const app = express();//to use express
const mongoose = require("mongoose");//to use database
const path = require("path");//to require local folders
const methodOverride = require("method-override");// to use self made methods like delete or update
const ejsMate = require("ejs-mate");//for styling
const session = require("express-session");//handling sessions
const MongoStore = require('connect-mongo');//handlig (~atlas)
const flash = require("connect-flash");//showing flash message
const passport = require("passport");// for authentication
const LocalStrategy = require("passport-local");// for storing usename and password in db
const User = require("./models/user.js");// simplifies building lofin system

const listingsRouter = require("./routes/listing.js");//importing listing route
const reviewsRouter = require("./routes/review.js");// importing review route
const userRouter = require("./routes/user.js");//importing user route

// const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';// database link /wanderlust is the name of database

const dbUrl = process.env.ATLASDB_URL;

//mongo default code
main()
.then(()=>{
    console.log("Connected to Db");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}
//.

app.set("view engine","ejs");//to render html with ejs
app.set("views",path.join(__dirname,"views"));//It tells Express that all your view templates (like .ejs files) will be found inside the /views directory of your project.
app.use(express.urlencoded({extended: true}));//to parse form data collected
app.use(methodOverride("_method"));// to define methods
app.engine('ejs',ejsMate);//enables you to write more maintainable and DRY EJS views with layout support.
app.use(express.static(path.join(__dirname,"/public")));//to use static files

//mongo store information 
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600,
});

store.on("error",()=>{
    console.log("Error in MONGO SESSION STORE",err);
});

//session & cookies
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7 * 24 * 60 * 60 *1000,
        httpOnly: true,
    },
};
app.get('/', (req, res) => {
    res.send('Wanderlust API is running 🚀');
});  

//session id & cookie
app.use(session(sessionOptions));
//flash messages
app.use(flash());

//initializing passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//flash message for success and error
app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user; 
    res.locals.mapKey = process.env.MAP_TOKEN;
    next();
});

//listing route imported
app.use("/listings",listingsRouter);

//review route imported
app.use("/listings/:id/reviews",reviewsRouter);

//user router
app.use("/",userRouter);

//handling errors using middleware
app.use((err,req,res,next)=>{
    const {statusCode = 500, message = "Something went Wrong!"} = err;
    res.render("error.ejs",{message});
});

//port no
app.listen(8080,()=>{
    console.log("Server is listening to port 8080");
});