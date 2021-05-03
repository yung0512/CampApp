const BaseJoi = require("joi");
//use Joi define error schema
const sanitizeHtml = require("sanitize-html");
//a joi extension to validate that people is tring to inject html tag in input field
const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML",
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [], //no tags are allowed
          allowedAttributes: {},
        });
        if (clean !== value)
          return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});
const Joi = BaseJoi.extend(extension);
const campgroundSchema = Joi.object({
  //server error handling
  campground: Joi.object({
    //images: Joi.string().required(),
    description: Joi.string().required().escapeHTML(),
    location: Joi.string().required().escapeHTML(),
    title: Joi.string().required().escapeHTML(),
    price: Joi.number().required().min(0),
  }).required(),
  deleteImages: Joi.array(),
}); //define Joi schema must have which key
const reviewSchema = Joi.object({
  review: Joi.object({
    body: Joi.string().required(),
    rating: Joi.number().required().min(1).max(5),
  }).required(),
});

module.exports = { campgroundSchema, reviewSchema };
