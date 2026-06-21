import ImageKit from '@imagekit/nodejs';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export async function uploadImage(fileBuffer, filename) {
  try {
    // ✅ FIX: Buffer ko Base64 string mein convert karo taaki ImageKit SDK ise accept kare
    const base64File = fileBuffer.toString("base64");

    const result = await imagekit.files.upload({
      file: base64File,         // 👈 Raw buffer ki jagah base64 string pass karo
      fileName: filename,       
      folder: "/chat_images",   
      useUniqueFileName: true,
    });

    return {
      url: result.url,
      fileId: result.fileId,
      fileTitle: result.name,
    };
  } catch (error) {
    console.error('Error uploading image through ImageKit files SDK instance:', error);
    throw error;
  }
}