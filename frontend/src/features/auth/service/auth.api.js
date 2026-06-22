import axios from 'axios'
const api = axios.create({
    baseURL : {
      "https://sketch-ai-earj.onrender.com": "https://sketch-ai-earj.onrender.com",
      "http://localhost:3000": "http://localhost:3000"
    }[process.env.NODE_ENV] || "http://localhost:3000",
    withCredentials: true
})
export async function login(email , password){
try{
const res =await  api.post("/api/auth/login",{
    email , password
})
return res.data 

}
catch(err){
    throw err 
    console.log(err)
}

}
export async function register(username , email , password){
try{
const res = await api.post("/api/auth/register",{username , email , password})
return res.data 

}
catch(err){
    throw err 
    console.log(err)
}

    
}
export async function getme(){
    try{
const res =await api.get("/api/auth/getme")
return res.data

    }
    catch(err){
        console.log(err)
        throw err 
    }
}
