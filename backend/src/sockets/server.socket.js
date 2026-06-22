import { Server } from "socket.io";
let io ;
export function initsocket(httpserver){
    io = new Server(httpserver , {
        cors : {
             credentials : true ,
     origin: [
    "http://localhost:5173",
    "https://sketch-ai-earj.onrender.com"
   
  ]
        }
    })
    io.on("connection",(socket)=>{
        console.log("a user connected" + socket.id)
    })
}
export function getio(){
    if(!io){
        throw new Error("socket not intialize")
    }
    return io 
}








