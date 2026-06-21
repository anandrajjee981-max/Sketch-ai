import axios from 'axios'

const api = axios.create({
    baseURL : "http://localhost:3000",
    withCredentials: true
})


export async function sendmessage(message, chat, imageUrl){
  try {
    const res = await api.post("/api/chats/message", { 
      message, 
      chat,
      imageUrl // <-- Yeh ab backend ko milega req.body mein
    });

    return res.data;
  }
  catch(err){
    console.log(err);
    throw err;
  }
}

export async function getchats(){
    try {
      const res = await api.get("/api/chats/")
      return res.data
    }
    catch(err){
        console.log(err)
    }
}

export async function uploadimage(payload) {
  try {
    let body;

    if (payload instanceof FormData) {
      body = payload;
    } else {
      body = new FormData();
      body.append("image", payload);
    }

    // ❌ headers mat bhejo, axios khud boundary ke saath set karega
    const res = await api.post("/api/chats/upload", body);

    return res.data;
  } catch (err) {
    console.error("Frontend upload error:", err);
    throw err;
  }
}

export async function getmessage(chat){
  try {
    const res = await api.get(`/api/chats/${chat}`)
    return res.data
  }
  catch(err){
      console.log(err)
  }
}

export async function deletemessage(chat){
    try {
      const res = await api.delete(`/api/chats/delete/${chat}`)
      return res.data
    }
    catch(err){
        console.log(err)
    }
}