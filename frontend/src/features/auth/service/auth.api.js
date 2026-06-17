import axios from 'axios'
const api = axios.create({
    baseURL : "http://localhost:3000",
    withCredentials : true ,
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



    
}

