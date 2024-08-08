import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import io from 'socket.io-client'

const socket=io('http://localhost:5000')
const Home = () => {

    const location=useLocation();
    const navigate=useNavigate();
    const{username,image,userId}=location.state || {};
    const[users,setUsers]=useState([])
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)



    useEffect(() =>{
        const fetchUsers=async() =>{
            try{
                const res=await axios.get('http://localhost:5000/api/auth/users',{
                    headers:{Authorization:`Bearer ${localStorage.getItem('token')}`}
                })
                setUsers(res.data)
            }catch(err){
                console.error('Error fetching users',err)
            }
        }
        fetchUsers()

        socket.on('receive_message',(message) =>{
            console.log('Message received',message)
            setMessages((prevMessages) => [...prevMessages,message])
        })

        socket.on('messages_deleted',({ userId:senderId,selectedUserId}) =>{
            if(
                (userId === senderId && selectedUser && selectedUser._id === selectedUserId) || 
                (userId === selectedUserId && selectedUser && selectedUser._id === senderId) 

            ){
                setMessages([])
            }
        })
        return() =>{
            socket.off('receive_message')
            socket.off('messages_deleted')
        }
    },[selectedUser,userId])

      useEffect(() => {
    if (userId) {
      socket.emit('join_room', userId);
      console.log(`User ${userId} joined room`);
    }
  }, [userId]);
  
  useEffect(() =>{
    if(selectedUser){
        const fetchMessages=async() =>{
            try{
                const res=await axios.get(`http://localhost:5000/api/auth/messages/${userId}/${selectedUser._id}`)
                setMessages(res.data)
            }catch(err){
                console.error('Error fetching messages',err)
            }
        }
        fetchMessages()
    }
  })

    const handleSendMessage=()=>{
        if(message.trim() && selectedUser){
            const msg={
                from:userId,
                to:selectedUser._id,
                content:message,
                timestamp:new Date().toISOString(),
            }
            socket.emit('send_message',msg)
            setMessages((prevMessages)=> [...prevMessages,msg])
            setMessage('')
        }else{
            console.error('Message not sent')
        }
    }

const deleteAllMessages= async ()=>{
   if(!selectedUser) return;
   console.log(`Deleting all messages b/w userId: ${userId} and ${selectedUser._id}`)
   try{
    await axios.delete(`http://localhost:5000/api/auth/messages/${userId}/${selectedUser._id}`,{
        headers:{Authorization:`Bearer ${localStorage.getItem('token')}`}
    })
    setMessages([])
   }catch(err){
    console.error('Error deleting messages',err)
   }
}
const handleLogout=()=>{
    localStorage.removeItem('token');
    navigate('/login')
}


  return (
    <div className='home-container'>
       <div className='sidebar'>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
        <h2>Users</h2>
        <ul className="user-list">
            {users.filter((user) => user._id !== userId).map((user) =>(
           <li className='user-item' key={user._id} onClick={() => setSelectedUser(user)}>
            <img src={`http://localhost:5000/${user.image}`} className='user-image'></img>
            <span className="user-username">{user.username}</span>
           </li>
           ))}
        </ul>
       </div>
       <div className='content'>
        <div className='profile-section'>
            <img src={`http://localhost:5000/${image}`}  className='profile-image'></img>
            <span className='username'>{username}</span>
        </div>

       {selectedUser ? (

        <div className='chat-container'>
            <h2>Chat with {selectedUser.username}</h2>
            <div className='messages'>
                {messages 
                  .filter(
                    (msg)=>
                    (msg.from === userId && msg.to === selectedUser._id) ||
                    (msg.from === selectedUser._id && msg.to === userId)
                  )
                  .map((msg,index) =>(
                
                <div key={index} className={`message ${msg.from === userId ? 'sent' : 'received'}`}>
                    <img src={`http://localhost:5000/${msg.from === userId ? image: selectedUser.image}`}></img>
                    <p>{msg.content}</p>
                    <div className='timestamp'>{new Date(msg.timestamp).toLocaleTimeString()}</div>
                </div>
                  ))}
            </div>
            <div className='message-input'>
                <input
                   type="text"
                   value={message}
                   onChange={(e) =>setMessage(e.target.value)}
                   placeholder='Typea message'
                ></input>
                <button onClick={handleSendMessage}>Send</button>
                <button onClick={deleteAllMessages}>Delete</button>
            </div>
        </div>
       ):(
        <div className='no-chat'>Selct a user to start chat</div>
       )}
       </div>
    </div>
  )
}

export default Home
