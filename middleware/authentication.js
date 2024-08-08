const jwt=require('jsonwebtoken')
const User=require('../models/User')

const authenticate=async (req,res,next)=>{
    const token=req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
     try {
    const decoded = jwt.verify(token, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmIwNjYxODcxY2IwMjI4OGU2NDE0MWIiLCJpYXQiOjE3MjI4NTQ0OTIsImV4cCI6MTcyMjg1ODA5Mn0.46SUTUWbdqcujHqZIXukieJ-buDz1rell03HtO4TVDI'); // Use your JWT secret
    req.user = await User.findById(decoded.userId);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

module.exports = authenticate;