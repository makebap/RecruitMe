const mongoose = require('mongoose');
const Job = require('../models/job');
const { cloudinary } = require('../cloudinary/config');

module.exports.index =
    async (req, res) => {
        if (req.cookies.comeback) {
            res.clearCookie('comeback');
        }
        if(req.query.search){
            const title = req.query.search;
            const job = await Job.findOne({ title: `${title}` });
            if (job) {
                return res.render('jobs/show', {job});
            } else {
                return res.render('jobs/home');
            }
        } else {
            const jobs = await Job.find({});
            res.render('jobs/index', {jobs});
        }
    }

module.exports.addNew =
    async (req, res, next) => {
        if (req.cookies.comeback) {
            res.clearCookie('comeback');
        }
        const job = new Job(req.body.job);
        job.images = req.files.map(f => ({ url: f.path, fileName: f.filename }));
        console.log(job.images);
        if(!job.images[0]){
            job.images[0] = {
                url: 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg?20200913095930',
                fileName: 'No image'
            } 
        }
        if (req.session.user_id) {
            try {
                job.owner = req.session.user_id;
                await job.save({ runValidators: true });
                req.flash('success', 'Successfully added a job listing.');
                return res.redirect(`/jobs/${job._id}`);
            } catch (e) {
                console.log(e);
                req.flash('error', 'There was a validation error. Please review the form.');
                return res.render('jobs/new');
            }
        } else {
            req.flash('error', 'You need to sign in to do that.');
            res.cookie('comeback', 'new');
            return res.redirect('/signin');
        }
    }

module.exports.new =
    (req, res) => {
        if (req.cookies.comeback) {
            res.clearCookie('comeback');
        }
        if (!req.session.user_id) {
            req.flash('error', 'You need to sign in to do that.');
            res.cookie('comeback', 'new');
            return res.redirect('/signin');
        }
        res.render('jobs/new');
    }

module.exports.show =
    async (req, res, next) => {
        if (req.cookies.comeback) {
            res.clearCookie('comeback');
        }
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            const job = await Job.findById(req.params.id);
            if (!job) {
                req.flash('error', 'Couldn\'t find that page.');
                return res.redirect('/jobs');
            }
            return res.render('jobs/show', { job });
        }
        res.redirect('/jobs');
    }

module.exports.update =
    async (req, res, next) => {
        if (req.cookies.comeback) {
            res.clearCookie('comeback');
        }
        const { id } = req.params;
        if (!req.session.user_id) {
            req.flash('error', 'You need to sign in to do that.');
            res.cookie('comeback', `${id}/edit`);
            return res.redirect('/signin');
        }
        const job = await Job.findByIdAndUpdate(id, { ...req.body.job }, { runValidators: true });
        var checkJob = await Job.findById(id);
        if (!req.session.user_id || checkJob.owner != req.session.user_id) {
            return res.redirect('/jobs/');
        }
        const imgs = req.files.map(f => ({ url: f.path, fileName: f.filename }));
        console.log(job.images[0]);
        if (job.images[0].url == 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg?20200913095930') {
            job.images.pop();
        }
        job.images.push(...imgs);
        await job.save();
        if (req.body.deleteImages) {
            for (let fileName of req.body.deleteImages) {
                await cloudinary.uploader.destroy(fileName);
            }
            await job.updateOne({ $pull: { images: { fileName: { $in: req.body.deleteImages } } } });
        }
        checkJob = await Job.findById(id);
        console.log(checkJob.images);
        if (!checkJob.images[0]) {
            console.log('chaning img')
            await Job.findByIdAndUpdate(id, {
                images:
                    [
                        {
                            url: 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg?20200913095930',
                            fileName: 'No image'
                        }
                    ]
            });
        }
        req.flash('success', 'Successfully updated a job listing.');
        res.redirect(`/jobs/${job._id}`);
    }

module.exports.delete =
    async (req, res) => {
        if (req.cookies.comeback) {
            res.clearCookie('comeback');
        }
        const { id } = req.params;
        const checkJob = await Job.findById(id);
        if (!req.session.user_id || checkJob.owner != req.session.user_id) {
            return res.redirect(`/jobs/${id}`);
        }
        console.log(req.body.deleteImages);
        if (req.body.deleteImages) {
            for (let fileName of req.body.deleteImages) {
                await cloudinary.uploader.destroy(fileName);
            }
        }
        await Job.findByIdAndDelete(id);
        req.flash('success', 'Successfully deleted a job listing.');
        res.redirect('/jobs');
    }

module.exports.edit =
    async (req, res, next) => {
        if (req.cookies.comeback) {
            res.clearCookie('comeback');
        }
        const { id } = req.params;
        if (mongoose.Types.ObjectId.isValid(id)) {
            const job = await Job.findById(id);
            if (!req.session.user_id || job.owner != req.session.user_id) {
                return res.redirect(`/jobs/${id}`);
            }
            if(!job){
                req.flash('error', 'Couldn\'t find that page.');
                return res.redirect('/jobs');
            }
            return res.render('jobs/edit', {job});
        }
        req.flash('error', 'Couldn\'t find that page.');
        res.redirect('/jobs');
    }