const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/create', roleMiddleware(['USER']), orderController.createOrder);
router.put('/status', roleMiddleware(['ADMIN', 'OWNER']), orderController.changeOrderStatus);
router.get('/user_orders', roleMiddleware(['USER']), orderController.getUserOrders);
router.get('/products', roleMiddleware(['USER']), orderController.getOrderProducts);
router.put('/cancel', roleMiddleware(['USER']), orderController.cancelOrder);

module.exports = router;
