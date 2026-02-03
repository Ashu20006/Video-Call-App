const express=require('express')
const router =express.Router();
const {registerUser,loginUser}=require('../controller/authController')
const {protect}=require('../middleware/authMiddleware')

router.post('/register',registerUser);

router.post('/login',loginUser)


router.get('/me',protect, (req, res)=>{
    res.json(req.user);
});
module.exports=router;