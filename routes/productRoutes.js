const express = require('express');
const productController = require('../controller/productController');
const router = express.Router();
const roleMiddleware = require('../middleware/roleMiddleware');
const fileMiddleware = require('../middleware/fileMiddleware');

router.get('/', productController.getProduct);
router.post('/add', [roleMiddleware(['ADMIN', 'OWNER']), fileMiddleware()], productController.addProduct);
router.delete('/delete', roleMiddleware(['ADMIN', 'OWNER']), productController.deleteProduct);
router.put('/update', roleMiddleware(['ADMIN', 'OWNER']), productController.updateProduct);

module.exports = router;
