const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.alternatives().try(
            Joi.object({
                url: Joi.string().uri().required(),
                filename: Joi.string().required()
            }),
            Joi.allow(null),
            Joi.allow('')
        ).optional().allow(null) // <- Allow the entire key to be null or missing        
    }).required(),
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required()
})