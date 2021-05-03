const mongoose = require("mongoose");
const cities = require("./cities");
const Campground = require("../models/campground");
const { places, descriptors } = require("./seedHelpers");
mongoose.connect("mongodb://localhost:27017/campMap", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console.log("connection error")));
db.once("open", () => {
  console.log("database connected");
});
const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({}); //delete everything

  for (let i = 0; i < 50; i++) {
    const price = Math.floor(Math.random() * 20) + 10;
    const random1000 = Math.floor(Math.random() * 1000);
    const camp = new Campground({
      author: "608665fe6b4bd878ef6cfc7d",
      location: `${cities[random1000].city},${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      images: [
        {
          url:
            "https://res.cloudinary.com/dsz1v56zw/image/upload/v1619598190/YelpCamp/ie5fhyqpr8rolsy6bagr.jpg",
          filename: "YelpCamp/ie5fhyqpr8rolsy6bagr",
        },
      ],
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      description:
        "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Possimus, vel magni amet et dignissimos, nam suscipit repellendus molestiae in laboriosam reprehenderit ipsum facere id quis voluptatem. Illo magni laudantium tempora.",
      price: price,
    });
    await camp.save();
  }
}; //the CRUD operation in mogodb is async
seedDB();
