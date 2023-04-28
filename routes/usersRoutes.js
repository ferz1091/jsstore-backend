const express = require('express');
const router = express.Router();
const roleMiddleware = require('../middleware/roleMiddleware');
const usersController = require('../controller/usersController');

router.get('/get', roleMiddleware(['ADMIN', 'OWNER']), usersController.users);
router.put('/role', roleMiddleware(['OWNER']), usersController.changeUserRole);
router.delete('/delete', roleMiddleware(['OWNER']), usersController.deleteUser);
router.get('/info', roleMiddleware(['USER']), usersController.getUserInfo);
router.get('/email_check', roleMiddleware(['USER']), usersController.checkMailAvailable);
router.put('/edit', roleMiddleware(['USER']), usersController.editUserInfo);
router.get('/email_change', roleMiddleware(['USER']), usersController.getEmailChangeConfirmationCode);
router.post('/email_send', roleMiddleware(['USER']), usersController.resendActivationLink);
router.put('/change_password', roleMiddleware(['USER']), usersController.changeUserPassword);
router.get('/sessions', roleMiddleware(['USER']), usersController.getUserSessions);
router.put('/close_session', roleMiddleware(['USER']), usersController.closeSession);

module.exports = router;
