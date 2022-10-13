var express = require('express');
var router = express.Router();
const UserController=require('../controllers/userController')

const checkUserAuth=require("../middlewares/auth-middleware")

router.use('/changepassword',checkUserAuth)
router.use('/loggeduser',checkUserAuth)


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//public routes
router.post('/register',UserController.UserRegistration)
router.post('/login',UserController.UserLogin)
router.post('/send-reset-password-email',UserController.sendUserPasswordResetEmail)
router.post('/reset-password/:id/:token',UserController.userPasswordReset)

//protected routes
router.post('/changepassword',UserController.changeUserPassword)
router.get('/loggeduser',UserController.loggedUser)

module.exports = router;
