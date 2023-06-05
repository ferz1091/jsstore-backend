const types = ['image/png', 'image/jpg', 'image/jpeg'];

const fileFilter = (req, file, cb) => {
    if (types.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const multer = require('multer')({
    dest: 'images/',
    fileFilter,
    limits: { fileSize: 1000000 }
});
const upload = multer.array('files', 10);

module.exports = function () {
    return function (req, res, next) {
        upload(req, res, (err) => {
            if (err) return res.send({error: err.code});
            next();
        })
    }
}
