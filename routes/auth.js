const express=require('express')
const jwt=require('jsonwebtoken')
const upload=require('../middleware/upload')
const router=express.Router()
const User=require('../models/User')
const authenticate=require('../middleware/authentication')
const Message=require('../models/Message')

const JWT_SECRET='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmIwNjYxODcxY2IwMjI4OGU2NDE0MWIiLCJpYXQiOjE3MjI4NTQ0OTIsImV4cCI6MTcyMjg1ODA5Mn0.46SUTUWbdqcujHqZIXukieJ-buDz1rell03HtO4TVDI';

router.post('/register', upload.single('image'),async(req,res) =>{
    const{username,password}=req.body;
    const image=req.file.path;

    try{
        const user=new User({username,password,image});
        await user.save();

        res.status(201).json({message:'User registered successfully'})
    }catch(err){
        console.error('Error registering user:', err);
        res.status(500).json({message:'Error registering user'})

        }
            

})

//Login

router.post('/login',async(req,res) =>{
    const{username,password}=req.body;
    try{
        const user=await User.findOne({username})
        if(!user){
            return res.status(404).json({message:'User not found'})
        }
        if(password !== user.password){
            return res.status(401).json({message:'Invalid password'})
        }

        const token=jwt.sign({userId:user._id}, JWT_SECRET,{expiresIn:'1h'});
        console.log('Generated token:', token);
        res.json({token,userId:user._id,username:user.username,image:user.image})
    }catch(err){
        console.error('Error logging in user:', err);
        res.status(500).json({message:'Error logging in user'})
    }
})


router.get('/users',authenticate,async(req,res)=>{
    try{
        const loggedInUserId=req.user._id;
        const users=await User.find({_id:{$ne:loggedInUserId}}).select('username image')
        res.json(users)
    }catch(err){
        res.status(500).json({message:'Error getting users'})
    }
})

router.get('/messages/:userId/:selectedUserId',async(req,res) =>{
    const {userId,selectedUserId} =req.params;
    try{
        const messages=await Message.find({
            $or:[
                {from:userId,to:selectedUserId},
                {from:selectedUserId,to:userId}
            ]
        })
        res.json(messages)
    }catch(err){
        res.status(500).json({message:'Error getting messages'})
    }
})

router.delete('/messages/:userId/:selectedUserId', authenticate, async (req, res) => {
    const { userId, selectedUserId } = req.params;
  
    try {
      const result = await Message.deleteMany({
        $or: [
          { from: userId, to: selectedUserId },
          { from: selectedUserId, to: userId }
        ]
      });
  
      if (result.deletedCount > 0) {
        req.app.get('io').emit('messages_deleted', { userId, selectedUserId }); // Emit an event to notify clients
        res.status(200).json({ message: 'All messages deleted successfully' });
      } else {
        res.status(404).json({ message: 'No messages found' });
      }
    } catch (err) {
      res.status(500).json({ message: 'Error deleting messages' });
    }
  });
  

module.exports=router;