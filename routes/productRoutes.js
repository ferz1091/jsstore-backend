const express = require('express');
const productController = require('../controller/productController');
const router = express.Router();
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', productController.getProduct);
router.post('/add', roleMiddleware(['ADMIN']), productController.addProduct);
router.delete('/delete', roleMiddleware(['ADMIN']), productController.deleteProduct);
router.put('/update', roleMiddleware(['ADMIN']), productController.updateProduct);

module.exports = router;
