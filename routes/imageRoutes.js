const express = require('express');
const router = express.Router();
const imageController = require('../controller/imageController');
const imageMiddleware = require('../middleware/imageMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/add', [imageMiddleware(), roleMiddleware(['OWNER'])], imageController.add);

module.exports = router;
