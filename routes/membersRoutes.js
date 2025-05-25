const router = require('express').Router()
const members = require('../controllers/membersControllers') 
const auth = require('../controllers/authController')
const authMiddleware = require('../middlewares/authMiddlewares')
const {check} = require('express-validator')



router.get('/',members.getmhome)

router.get('/reg',members.getreg)
router.post('/reg',[  
      check('username').notEmpty().withMessage("username must not be empty "),
      check('address').notEmpty().withMessage("address must not be empty "),
      check('contact').notEmpty().withMessage("contact must not be empty ").matches('^\\+\\d{7,15}$').withMessage('invalid phone number'),
    check('email').notEmpty().withMessage("email must not be empty ").isEmail().withMessage("enter correct email"),
    check('password').notEmpty().withMessage("password must not be empty").isStrongPassword({minLength:8,minNumbers:1,minUppercase:1,minSymbols:1}).withMessage('password must contain 8 characters and {number,uppercase and symbol}')
  ],auth.memberreg)

router.get('/login',authMiddleware.mam,members.getlogin)
router.post('/login',[
    check('username').notEmpty().withMessage("username must not be empty "),
    check('password').notEmpty().withMessage("password must not be empty")
],auth.memberlogin)

router.get('/forgotpassword',members.getmemberforgotpassword)
router.post('/forgotpassword',[
    check('email').notEmpty().withMessage("email must not be empty ").isEmail().withMessage("enter correct email")
  ],auth.memberforgotpassword)

router.post('/recoverpassword',[
    check('newpassword').notEmpty().withMessage("password must not be empty").isStrongPassword({minLength:8,minNumbers:1,minUppercase:1,minSymbols:1}).withMessage('password must contain 8 characters and {number,uppercase and symbol}')
],auth.memberrecoverpassword)

router.post('/logout',members.memberlogout)

router.post('/up',members.getup)
router.post('/updateprofile',[  
      check('address').notEmpty().withMessage("address must not be empty "),
      check('contact').notEmpty().withMessage("contact must not be empty ").matches('^\\+\\d{7,15}$').withMessage('invalid phone number'),
    check('email').notEmpty().withMessage("email must not be empty ").isEmail().withMessage("enter correct email")
  ],members.postup)

router.post('/uppass',members.uppass)
router.post('/changepass',[
     check('newpassword').notEmpty().withMessage("newpassword must not be empty").isStrongPassword({minLength:8,minNumbers:1,minUppercase:1,minSymbols:1}).withMessage('newpassword must contain 8 characters and {number,uppercase and symbol}')
],members.changepass)

router.post('/standardmonthly',members.standardmonthly)
router.post('/standardyearly',members.standardyearly)
router.post('/premiummonthly',members.premiummonthly)
router.post('/premiumyearly',members.premiumyearly)
router.post('/lifetime',members.lifetime)

router.post('/invoice',members.invoice)

router.get('/complete',members.complete)
router.get('/completeone',members.completeone)

router.post('/paymenthistory',members.paymenthistory)

router.post('/cancelsubscription',members.cancelsubscription)

router.post('/tac',members.tac)

router.post('/upm',members.upm)
router.get('/successupm',members.successupm)

module.exports = router