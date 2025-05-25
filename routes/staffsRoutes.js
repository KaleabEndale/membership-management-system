const router = require('express').Router()
const staffs = require('../controllers/staffsController') 
const auth = require('../controllers/authController')
const authMiddleware = require('../middlewares/authMiddlewares')
const avedMiddleware = require('../middlewares/avedMiddleware')
const {check} = require('express-validator')


router.get('/',authMiddleware.sam,staffs.getstaff)

router.post('/login',[
    check('username').notEmpty().withMessage("username must not be empty "),
    check('password').notEmpty().withMessage("password must not be empty")
],auth.stafflogin)

router.get('/forgotpassword',staffs.getstaffforgotpassword)
router.post('/forgotpassword',[
    check('email').notEmpty().withMessage("email must not be empty ").isEmail().withMessage("enter correct email")
  ],auth.staffforgotpassword)

router.post('/recoverpassword',[
    check('newpassword').notEmpty().withMessage("password must not be empty").isStrongPassword({minLength:8,minNumbers:1,minUppercase:1,minSymbols:1}).withMessage('password must contain 8 characters and {number,uppercase and symbol}')
],auth.staffrecoverpassword)

router.post('/logout',staffs.stafflogout)

router.get('/addmember',avedMiddleware.staffcheck,staffs.getstaffaddmember)
router.get('/viewmember',avedMiddleware.staffcheck,staffs.getstaffviewmember)
router.get('/editmember',avedMiddleware.staffcheck,staffs.getstaffeditmember)
router.get('/deletemember',avedMiddleware.staffcheck,staffs.getstaffdeletemember)

router.get('/payformember',avedMiddleware.staffcheck,staffs.pfm)

module.exports = router