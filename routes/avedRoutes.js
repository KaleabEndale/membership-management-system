const router = require('express').Router()
const aved = require('../controllers/avedController')


router.post('/back',aved.back)

router.post('/addmember',aved.addmember)
router.post('/viewmember',aved.viewmember)
router.post('/findmember',aved.findmember)
router.post('/editmember',aved.editmember)
router.post('/deletemember',aved.deletemember)

router.post('/cm',aved.cm)
router.post('/pay',aved.pay)

router.post('/addstaff',aved.addstaff)
router.post('/viewstaff',aved.viewstaff)
router.post('/findstaff',aved.findstaff)
router.post('/editstaff',aved.editstaff)
router.post('/deletestaff',aved.deletestaff)




module.exports = router