const router = require('express').Router()
const staffs = require('../controllers/staffsController') 
const auth = require('../controllers/authController')
const authMiddleware = require('../middlewares/authMiddlewares')
const avedMiddleware = require('../middlewares/avedMiddleware')


router.get('/',authMiddleware.sam,staffs.getstaff)

router.post('/login',auth.stafflogin)

router.get('/forgotpassword',staffs.getstaffforgotpassword)
router.post('/forgotpassword',auth.staffforgotpassword)

router.post('/recoverpassword',auth.staffrecoverpassword)

router.post('/logout',staffs.stafflogout)

router.get('/addmember',avedMiddleware.staffcheck,staffs.getstaffaddmember)
router.get('/viewmember',avedMiddleware.staffcheck,staffs.getstaffviewmember)
router.get('/editmember',avedMiddleware.staffcheck,staffs.getstaffeditmember)
router.get('/deletemember',avedMiddleware.staffcheck,staffs.getstaffdeletemember)

router.get('/payformember',avedMiddleware.staffcheck,staffs.pfm)

module.exports = router