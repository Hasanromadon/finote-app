const User = require('../models/usersModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    //allowed field array
    //object dicari namanya, kemudian hasil dari arry object key di looping oleh for each, kemudian di filter . jika di body berisi allowed key, maka includes true dan buat object baru
    // obj = {name : hasan, password : 123, email : hsan@gmail.com, password : "hasan123"}
    //object.keys(obj) => [name, password, email, password] //return array
    //  [name, password, email, password].foreach/dicek satu2 
    //1[name, email].includes(name) => true buat object baru newObject {name : hasan}
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    })
    return newObj;
}


exports.getAllUser = catchAsync(async (req, res) => {

    const user = await User.find();

    res.status(200).json({
        status: 'success',
        result: user.length,
        data: user,
    });

});
exports.getOneUser = catchAsync(async (req, res) => {

    const user = await User.findById(req.params.id).populate('transactions');

    res.status(200).json({
        status: 'success',
        data: user,
    });

});

exports.deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
        next(new AppError(`cant find transaction with that ID`, 404));
    }

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

exports.updateMe = catchAsync(async (req, res, next) => {

    //create error if user post password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('this route not for password update, please use updateMe', 400));
    }

    //menyaring body yang diperbolehkan name email dan bisa ditambahkan yg lain
    const filteredBody = filterObj(req.body, 'name', 'email');
    //update user document 
    const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    }); //findbyidandupdate tidak menjalankan validator dan middleware

    res.status(200).json({
        status: 'succeess',
        data: {
            updateUser
        }
    })
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    //membuat yang status nya aktive jadi noaktif
    await User.findByIdAndUpdate(req.user.id, {
        active: false
    });

    res.status(204).json({
        status: "success",
        data: null
    })

})