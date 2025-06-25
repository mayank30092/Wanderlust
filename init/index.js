const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

main()
.then(()=>{
    console.log("Connected to Db");
})
.catch(err => console.log(err));


async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async() =>{
    await Listing.deleteMany({});//delete any existing data in db
    initData.data = initData.data.map((obj)=>({...obj, owner: '684666d4f9b0c2b5215dd47c'}));
    await Listing.insertMany(initData.data);// inserting new data of data.js
    console.log("data was initialized");
};

initDB();