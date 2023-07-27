const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    fname: {
        type: String,
        required: true
    },
    lname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    mailingList: {
        type: Boolean
    }
});

UserSchema.statics.findAndAuthenticate = async function (email, password) {
    const foundUser = await this.findOne({ email });
    if (foundUser) {
        const isValid = await bcrypt.compare(password, foundUser.password);
        if (isValid) {
            return foundUser;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 15);
    next();
})

module.exports = mongoose.model('User', UserSchema);