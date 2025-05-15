const router = require('express').Router()
const members = require('../controllers/membersControllers') 
const auth = require('../controllers/authController')
const authMiddleware = require('../middlewares/authMiddlewares')



router.get('/',members.getmhome)

router.get('/reg',members.getreg)
router.post('/reg',auth.memberreg)

router.get('/login',authMiddleware.mam,members.getlogin)
router.post('/login',auth.memberlogin)

router.get('/forgotpassword',members.getmemberforgotpassword)
router.post('/forgotpassword',auth.memberforgotpassword)

router.post('/recoverpassword',auth.memberrecoverpassword)

router.post('/logout',members.memberlogout)

router.post('/up',members.getup)
router.post('/updateprofile',members.postup)

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