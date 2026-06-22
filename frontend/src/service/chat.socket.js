import { io } from "socket.io-client";
export const intializesocket = ()=>{
const socket = io("https://sketch-ai-earj.onrender.com",{
    withCredentials : true
})
socket.on("connect",()=>{
    console.log("socket connected")
})




}