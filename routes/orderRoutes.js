const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/create', roleMiddleware(['USER']), orderController.createOrder);
router.put('/status', roleMiddleware(['ADMIN', 'OWNER']), orderController.changeOrderStatus);
router.delete('/delete', roleMiddleware(['ADMIN', 'OWNER']), orderController.deleteOrder);

module.exports = router;
