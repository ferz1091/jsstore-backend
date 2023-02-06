const express = require('express');
const productController = require('../controller/productController');
const router = express.Router();
const roleMiddleware = require('../middleware/roleMiddleware');
const fileMiddleware = require('../middleware/fileMiddleware');

router.get('/', productController.getProduct);
router.post('/add', [roleMiddleware(['ADMIN']), fileMiddleware()], productController.addProduct);
router.delete('/delete', roleMiddleware(['ADMIN']), productController.deleteProduct);
router.put('/update', roleMiddleware(['ADMIN']), productController.updateProduct);
router.post('/create-order', productController.createOrder);

module.exports = router;
