const express = require('express');
const router = express.Router();
const roleMiddleware = require('../middleware/roleMiddleware');
const usersController = require('../controller/usersController');

router.get('/get', roleMiddleware(['ADMIN', 'OWNER']), usersController.users);
router.put('/role', roleMiddleware(['OWNER']), usersController.changeUserRole);
router.delete('/delete', roleMiddleware(['OWNER']), usersController.deleteUser);

module.exports = router;
