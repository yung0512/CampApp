const { string } = require("joi");
const mongoose = require("mongoose");
const { campgroundSchema } = require("../schema");
const Review = require("./review");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: String,
  filename: String,
});
ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const opts = { toJSON: { virtuals: true } }; //the default mongo virtual property wont be send into response body nedd to declare option at here
const CampgroundSchema = new Schema(
  {
    title: String,
    images: [ImageSchema],
    price: Number,
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    description: String,
    location: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts
);
CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `
  <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
  <p>${this.description.substring(0, 20)}...</p>`;
});
CampgroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc && doc.reviews) {
    await Review.remove({
      _id: {
        $in: doc.reviews,
      },
    });
  }
}); // whem use findbyIdAndDelete will trigger "findOneAndDelete" middleware??
//a middle ware when delete campground also delete review too
module.exports = mongoose.model("Campground", CampgroundSchema);
