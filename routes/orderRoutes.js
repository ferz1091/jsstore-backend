const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/create', roleMiddleware(['USER']), orderController.createOrder);
router.post('/status', roleMiddleware(['ADMIN']), orderController.changeOrderStatus);
router.delete('/delete', orderController.deleteOrder);

module.exports = router;
