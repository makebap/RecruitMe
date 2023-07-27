const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const { ValidateJob } = require('../utils/ValidateJob');
const jobs = require('../controllers/jobs');
const multer = require('multer');
const { storage } = require('../cloudinary/config');
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(jobs.index))  
    .post(upload.array('job[imageFile]'), ValidateJob,  catchAsync(jobs.addNew));

router.get('/new', jobs.new);

router.route('/:id')
    .get(catchAsync(jobs.show))
    .put(upload.array('job[imageFile]'), ValidateJob, catchAsync(jobs.update))
    .delete(catchAsync(jobs.delete));

router.get('/:id/edit', catchAsync(jobs.edit));

module.exports = router;