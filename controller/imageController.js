const Image = require('../models/Image');

class ImageController {
    add(req, res) {
        try {
            const file = req.file;
            const desc = req.body.desc;
            if (!file && !desc) {
                return res.status(400).json({message: 'File or description is undefined'})
            }
            const image = new Image({path: file.destination + file.filename, desc});
            image.save();
            return res.status(200).json({message: 'Image has uploaded'})
        } catch (e) {
            console.log(e);
            return res.status(400).json({message: 'Error'})
        }
    }
}

module.exports = new ImageController();
