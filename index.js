if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const ejsmate = require('ejs-mate');
const AppError = require('./utils/AppError');
const mainRoutes = require('./routes/main');
const jobsRoutes = require('./routes/jobs');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_PUBLIC_URL, {dbName: process.env.DB_NAME, useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
    console.log("Connection successful");
}) .catch(e => {
    console.log("Connection unsuccessful. We ran into an error:\n");
    console.log(e);
});
const MongoStore = require('connect-mongo');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// ------------------------------ //

app.engine('ejs', ejsmate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
const scriptSrcUrls = [
    "https://cdn.jsdelivr.net",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [];
const fontSrcUrls = [
    "https://cdnjs.cloudflare.com/"
];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(cookieParser());

const store = MongoStore.create({
    mongoUrl: process.env.MONGODB_ADMIN_URL,
    dbName: process.env.DB_NAME,
    touchAfter: 24 * 3600,
    crypto: {
        secret: process.env.SECRET,
    }
});

store.on("error", function (e) {
    console.log(e);
});

const sessionConfig = {
    store,
    name: 'lskdvbkjlvnlawnev',
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7
    },
};
app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => {
    res.locals.currentUser = req.session.user_id;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/jobs', jobsRoutes);
app.use('/', mainRoutes);

// -----------------------------------------------------//

const hasher = async (pw) => {
    const hash = await bcrypt.hash(pw, 15);
    console.log(hash);
}

const login = async (pw, pwHashed) => {
    const result = await bcrypt.compare(pw, pwHashed);
    if (result) {
        console.log('good to go');
    } else {
        console.log('nope try again');
    }
}

const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }
    next();
}

app.all('*', (req, res, next) => {
    next(new AppError('Page not found.', 404));
    res.render('jobs/notfound');
});

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message){
        err.message = 'Something isn\'t right here.';
    }
    if(err.status == 404){
        return res.render('jobs/notfound');
    }
    res.status(statusCode).render('jobs/oops', {err});
})

app.listen(8080, () =>{
    console.log('Listening on port 8080');
});