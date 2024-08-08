import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
const Register = () => {
    const navigate=useNavigate()
    const[formData,setFormData]=useState({
        username:'',
        password:'',
        image:null
    })

    const handleChange=(e)=>{
        const {name,value}=e.target;
        setFormData({
            ...formData,
            [name]:value
        })
    }
  const handleFileChange=(e)=>{
    setFormData({
        ...formData,
        image:e.target.files[0]
    })
  }


    const handleSubmit= async (e)=>{
       e.preventDefault();
       const data=new FormData();
       data.append('username',formData.username);
       data.append('password',formData.password);
       data.append('image',formData.image);

       try{
        const res=await axios.post('http://localhost:5000/api/auth/register',data);
        console.log(res.data)
        navigate('/login')
       }catch(err){
        console.error(err)
       }
    }
    const handleNavigate=()=>{
      navigate('/login')
    }
  return (
    <div className="register-container">
        <form onSubmit={handleSubmit} className='register-form'>
            <h2>Register</h2>
            <div className="form-group">
                <label htmlFor="username">Username:</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                ></input>

            </div>
            <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                ></input>
                
            </div>
            <div className="form-group">
                <label htmlFor="image">Upload Image:</label>
                <input
                  type="file"
                  id="image"
                  name="image"
                 
                  onChange={handleFileChange}
                  className='register-button'
                  required
                ></input>
                
            </div>
            <button type="submit"  className='register-button'>Register</button>
            <p>Already have an account?<button onClick={handleNavigate}  className='register-button'>Login</button></p>
        </form>
     
    </div>
  )
}

export default Register
