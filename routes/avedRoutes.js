const router = require('express').Router()
const aved = require('../controllers/avedController')
const {check} = require('express-validator')


router.post('/back',aved.back)

router.post('/addmember',[  
      check('username').notEmpty().withMessage("username must not be empty "),
      check('address').notEmpty().withMessage("address must not be empty "),
      check('contact').notEmpty().withMessage("contact must not be empty ").matches('^\\+\\d{7,15}$').withMessage('invalid phone number'),
    check('email').notEmpty().withMessage("email must not be empty ").isEmail().withMessage("enter correct email"),
    check('password').notEmpty().withMessage("password must not be empty").isStrongPassword({minLength:8,minNumbers:1,minUppercase:1,minSymbols:1}).withMessage('password must contain 8 characters and {number,uppercase and symbol}')
  ],aved.addmember)
router.post('/viewmember',aved.viewmember)
router.post('/findmember',aved.findmember)
router.post('/editmember',aved.editmember)
router.post('/deletemember',[  
      check('username').notEmpty().withMessage("username must not be empty ")
],aved.deletemember)

router.post('/cm',aved.cm)
router.post('/pay',aved.pay)

router.post('/addstaff',[  
      check('username').notEmpty().withMessage("username must not be empty "),
      check('address').notEmpty().withMessage("address must not be empty "),
      check('contact').notEmpty().withMessage("contact must not be empty ").matches('^\\+\\d{7,15}$').withMessage('invalid phone number'),
    check('email').notEmpty().withMessage("email must not be empty ").isEmail().withMessage("enter correct email"),
    check('password').notEmpty().withMessage("password must not be empty").isStrongPassword({minLength:8,minNumbers:1,minUppercase:1,minSymbols:1}).withMessage('password must contain 8 characters and {number,uppercase and symbol}')
  ],aved.addstaff)
router.post('/viewstaff',aved.viewstaff)
router.post('/findstaff',aved.findstaff)
router.post('/editstaff',aved.editstaff)
router.post('/deletestaff',[  
      check('username').notEmpty().withMessage("username must not be empty ")
],aved.deletestaff)




module.exports = router