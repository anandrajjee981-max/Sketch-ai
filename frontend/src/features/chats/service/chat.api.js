import axios from 'axios'
const api = axios.create({
    baseURL :  "https://sketch-ai-earj.onrender.com",
    withCredentials: true
})

// ✅ NEW MODIFIED SENDMESSAGE: Yeh ab Form-Data handle karega (Text + Image/PDF file ek sath)
export async function sendmessage(payload) {
  try {
    let body;
    let headers = {};

    // Agar payload already FormData hai (Premium single-request upload structure)
    if (payload instanceof FormData) {
      body = payload;
      // Jab dynamic boundaries bhej rahe hon, toh axios ko khud header setup karne dete hain, par multipart explicitly identify ho jata hai.
    } else {
      // Safe fallback: Agar purane style se plane object aaya ho `{ message, chat, imageUrl }`
      body = new FormData();
      if (payload.message) body.append("message", payload.message);
      if (payload.chat) body.append("chat", payload.chat);
      if (payload.imageUrl) body.append("imageUrl", payload.imageUrl);
    }

    // 🔥 Crucial Clue: Route ko correct kiya backend path se match karne ke liye
    const res = await api.post("/api/chats/message", body, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return res.data;
  }
  catch(err){
    const payloadData = err.response?.data;
    console.error("chat.api.sendmessage error:", payloadData || err.message || err);

    if (payloadData) {
      const combined = payloadData.message && payloadData.error ? `${payloadData.message} - ${payloadData.error}` : (payloadData.message || payloadData.error);
      const statusPart = err.response?.status ? ` (status ${err.response.status})` : '';
      throw new Error(`${combined || 'Request failed'}${statusPart}`);
    }

    throw new Error(err.message || 'Request failed');
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

// ⚠️ Note: Yeh function ab deprecated (use-less) hai kyunki hum sendmessage mein merge kar chuke hain.
// Fir bhi ise rehne dete hain taaki aapka code load hone par crash na ho.
export async function uploadimage(payload) {
  try {
    let body;
    if (payload instanceof FormData) {
      body = payload;
    } else {
      body = new FormData();
      body.append("file", payload); // Key 'image' se badalkar 'file' ki taaki backend error na de
    }

    const res = await api.post("/api/chats/upload", body);
    return res.data;
  } catch (err) {
    console.error("Frontend upload error:", err);
    throw err;
  }
}

export async function getmessage(chat){
  try {
    // Edge case guard: Agar chat undefined hai, toh call hi mat karo
    if (!chat || chat === "undefined") return { success: true, message: [] };
    
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