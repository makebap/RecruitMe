const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const JobSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    images: [
        {
            url: String,
            fileName: String
        }
    ],
    salary: {
        type: String,
        required: true
    },
    frequency: {
        type: String,
        default: 'month'
    },
    schedule: {
        type: String,
        required: true
    },
    level: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Job', JobSchema);