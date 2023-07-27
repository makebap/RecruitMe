const BaseJoi = require('joi');
const sanitize = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not inclue HTML.'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitize(value, {
                    allowedTags: [],
                    allowedAttributes: {}
                });
                if (clean !== value) {
                    return helpers.error('string.escapeHTML', { value });
                }
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

module.exports.jobSchema = new Joi.object({
    job: Joi.object({
        title: Joi.string().required().escapeHTML(),
        company: Joi.string().required().escapeHTML(),
        salary: Joi.string().required().pattern(/^[1-9]([0-9]{1,9})?(.[0-9]{2})?$/).escapeHTML(),
        frequency: Joi.string().required().escapeHTML(),
        schedule: Joi.string().required().escapeHTML(),
        level: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
        location: Joi.string().required().escapeHTML(),
        images: [Joi.string().empty('').default('https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg?20200913095930').escapeHTML()]
    }).required(),
    deleteImages: Joi.array()
});