const router = require('express').Router()
const admins = require('../controllers/adminsController') 
const auth = require('../controllers/authController')
const authMiddleware = require('../middlewares/authMiddlewares')
const avedMiddleware = require('../middlewares/avedMiddleware')
const {check} = require('express-validator')


router.get('/',authMiddleware.aam,admins.getadmin)
router.post('/login',[
    check('username').notEmpty().withMessage("username must not be empty "),
    check('password').notEmpty().withMessage("password must not be empty")
],auth.adminlogin)

router.get('/forgotpassword',admins.getadminforgotpassword)
router.post('/forgotpassword',[
    check('email').notEmpty().withMessage("email must not be empty ").isEmail().withMessage("enter correct email")
  ],auth.adminforgotpassword)

router.post('/recoverpassword',[
    check('newpassword').notEmpty().withMessage("password must not be empty").isStrongPassword({minLength:8,minNumbers:1,minUppercase:1,minSymbols:1}).withMessage('password must contain 8 characters and {number,uppercase and symbol}')
],auth.adminrecoverpassword)

router.post('/logout',admins.adminlogout)


router.get('/addmember',avedMiddleware.admincheck,admins.getadminaddmember)
router.get('/viewmember',avedMiddleware.admincheck,admins.getadminviewmember)
router.get('/editmember',avedMiddleware.admincheck,admins.getadmineditmember)
router.get('/deletemember',avedMiddleware.admincheck,admins.getadmindeletemember)

router.get('/payformember',avedMiddleware.admincheck,admins.pfm)

router.get('/addstaff',avedMiddleware.admincheck,admins.getadminaddstaff)
router.get('/viewstaff',avedMiddleware.admincheck,admins.getadminviewstaff)
router.get('/editstaff',avedMiddleware.admincheck,admins.getadmineditstaff)
router.get('/deletestaff',avedMiddleware.admincheck,admins.getadmindeletestaff)

router.post('/emi',avedMiddleware.admincheck,admins.geteditmi)
router.post('/editmi',avedMiddleware.admincheck,admins.posteditmi)

router.get('/sau',avedMiddleware.admincheck,admins.getsau)

router.get('/temp1',admins.temp1)
router.get('/temp2',admins.temp2)
router.get('/temp3',admins.temp3)
router.get('/temp4',admins.temp4)
router.get('/temp5',admins.temp5)

router.post('/sau/sa',admins.sausa)
router.post('/sau/ss',admins.sauss)
router.post('/sau/sp',admins.sausp)
router.post('/sau/spl',admins.sauspl)
router.post('/sau/sl',admins.sausl)


router.post('/grr',admins.grr)
router.post('/prr',admins.prr)
router.post('/eurr',admins.eurr)

router.post('/al',admins.al)




module.exports = router