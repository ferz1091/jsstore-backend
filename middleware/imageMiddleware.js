const types = ['image/png', 'image/jpg', 'image/jpeg'];

const fileFilter = (req, file, cb) => {
    if (types.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const multer = require('multer')({
    dest: 'assets/',
    fileFilter,
    limits: { fileSize: 2000000 }
});
const upload = multer.single('image');

module.exports = function () {
    return function (req, res, next) {
        upload(req, res, (err) => {
            if (err) return res.send({ error: err.code });
            next();
        })
    }
}
