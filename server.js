const express=require('express')
const mongoose=require('mongoose')
const bodyParser=require('body-parser')
const cors=require('cors')
const http=require('http')
const socketIo=require('socket.io')
const Message=require('./models/Message')
const authRoutes=require('./routes/auth')
const app=express();
const PORT=5000;

const server=http.createServer(app);
const io=socketIo(server,{
    cors:{
        origin:"http://localhost:5173",
        methods:['GET','POST','DELETE'],
    }
})



mongoose.connect('mongodb://localhost:27017/mern2',{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(() =>console.log('Mongodb Connected'))
.catch((err)=>console.log(err))

app.use(cors())
app.use(bodyParser.json())
app.use('/api/auth',authRoutes)
app.use('/uploads',express.static('uploads'))
app.set('io',io)

io.on('connection',(socket) =>{
    console.log('New client connected')

    socket.on('join_room',(userId)=>{
        socket.join(userId);
        console.log(`User ${userId} joined room`)
    })

    socket.on('send_message',async(message) =>{
        console.log('Message received on server',message)
        const {from,to,content,timestamp} =message

        if(from && to && content){
            const newMessage=new Message({from,to,content,timestamp})
            await newMessage.save()

            io.to(to).emit('receive_message',message)
        }else{
            console.error('Message is missing from,to,content')
        }
    })

    socket.on('disconnect',()=>{
        console.log('Client disconnected')
    })
})



server.listen(PORT,() =>{
    console.log(`Server is running on port ${PORT}`)
})