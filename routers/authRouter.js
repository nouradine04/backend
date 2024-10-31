const express = require ('express')
const router = express.Router()
const authControllers = require('../controllers/authControllers')



router.post('/signup',authControllers.signup)
router.post('/signin',authControllers.signin)
router.get('/hotels',authControllers.listHotel )
router.post('/addHotel',authControllers.addHotel )
router.post('/signout',authControllers.signout )
router.post('/send-forgot-password-code', authControllers.VerificationMotDePasseOublieCodeValidation)
 
    



module.exports = router; 