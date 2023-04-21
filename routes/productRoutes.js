const express = require('express');
const productController = require('../controller/productController');
const router = express.Router();
const roleMiddleware = require('../middleware/roleMiddleware');
const fileMiddleware = require('../middleware/fileMiddleware');

router.get('/get', productController.getProducts);
router.post('/add', fileMiddleware(['ADMIN', 'OWNER']), productController.addProduct);
router.delete('/delete', roleMiddleware(['ADMIN', 'OWNER']), productController.deleteProduct);
router.put('/update', roleMiddleware(['ADMIN', 'OWNER']), productController.updateProduct);
router.get('/getfilter', productController.getFilterStats);
router.get('/getsale', productController.getSale);
router.post('/rate', roleMiddleware(['USER']), productController.rateProduct);
router.get('/comments', productController.getProductComments);
router.get('/byid', productController.getProductById);
router.post('/comment_delete', roleMiddleware(['USER']), productController.deleteRate);
router.post('/comment_edit', roleMiddleware(['USER']), productController.editRate);
router.put('/addtofav', roleMiddleware(['USER']), productController.addToFavorites);
router.put('/removefromfav', roleMiddleware(['USER']), productController.removeFromFavorites);
router.get('/getfavorites', roleMiddleware(['USER']), productController.getUserFavorites);

module.exports = router;
