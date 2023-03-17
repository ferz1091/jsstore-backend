const express = require('express');
const productController = require('../controller/productController');
const router = express.Router();
const roleMiddleware = require('../middleware/roleMiddleware');
const fileMiddleware = require('../middleware/fileMiddleware');

router.get('/get', productController.getProducts);
router.post('/add', fileMiddleware(), productController.addProduct);
router.delete('/delete', roleMiddleware(['ADMIN', 'OWNER']), productController.deleteProduct);
router.put('/update', roleMiddleware(['ADMIN', 'OWNER']), productController.updateProduct);
router.get('/getfilter', productController.getFilterStats);
router.get('/getsale', productController.getSale);

module.exports = router;
