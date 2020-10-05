const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
        name: {
            type: String,
            required: [true, 'Please tell us your name'],
        },
        email: {
            type: String,
            required: [true, 'Please provide your email'],
            unique: true,
            lowercase: true,
            validate: [validator.isEmail, 'Please provide a valid email'],
        },
        photo: String,
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'

        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: 8,
            select: false,
        },
        passwordConfirm: {
            type: String,
            required: [true, 'Please confirm your password'],
            validate: {
                //this only on save save
                validator: function (el) {
                    console.log(el);
                    return el === this.password;
                },
                message: 'Password are not the same',
            },
        },
        passwordChangeAt: {
            type: Date
        },
        passwordResetToken: String,
        passwordResetExpires: Date,
        active: {
            //active dihide
            type: Boolean,
            default: true,
            select: false
        },
    }, {
        toJSON: {
            virtuals: true
        },
        toObject: {
            virtuals: true
        }
    }

);
userSchema.pre(/^find/, function (next) {
    //tidak menampilankan yang statusnya tidak aktif

    this.find({
        active: {
            $ne: false
        }
    });

    next();
});

userSchema.virtual('transactions', {
    ref: 'Transaction',
    foreignField: 'user',
    localField: '_id'
});


userSchema.pre('save', async function (next) {
    //encrypt when modified or create new
    if (!this.isModified('password')) return next();

    //encrypt password
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined; //not presisted in database;
    next();
});

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangeAt = Date.now() - 1000 //dikurang seribu karena terkadang ada masalah token issued at dibuat lebih dulu dari pada password change at
    next();
});

//instances/membuat method yang tersedia disemua dokumen ini digunakan untuk decript
userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangeAt) {
        const changeTimestamp = parseInt(this.passwordChangeAt.getTime() / 1000, 10); //dibagi karena mongoose 1000x milecond dari waktu jwt
        return JWTTimestamp < changeTimestamp; //100 < 200 false oke
    }

}
userSchema.methods.createPasswordToken = function () {
    //buat token yang akan dikirimkan ke email
    const resetToken = crypto.randomBytes(32).toString('hex');

    //simpan encrypted token ke database
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;


    console.log(resetToken);
    console.log(this.passwordResetToken);
    //kembalikan nilai reset token yang akan digunakan untuk dikirim ke email
    return resetToken;

}

const User = mongoose.model('User', userSchema);

module.exports = User;