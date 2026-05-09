// --- TELEGRAM CONFIG ---
const TG_BOT_TOKEN = "8183244146:AAGc3zdrTFQBAICK7JEIuDZCQSZB4hHvITg";
const TG_CHAT_ID = "-1003967116090";

// Firebase Config (Hamesha initialized rahe)
const firebaseConfig = {
    apiKey: "AIzaSyDhqqHLeWTKGRc4-cHG2n8ALBt7zZFr8GQ",
    authDomain: "wishes-hub.firebaseapp.com",
    projectId: "wishes-hub",
    storageBucket: "wishes-hub.firebasestorage.app",
    messagingSenderId: "366690205259",
    appId: "1:366690205259:web:f82e09f5f8fd70dfd797ce"
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(), auth = firebase.auth();

// --- PERMANENT UPLOAD LOGIC ---
async function uploadToTelegram(file) {
    if(!file) return "";
    let formData = new FormData();
    formData.append("chat_id", TG_CHAT_ID);
    formData.append("photo", file);

    try {
        const res = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendPhoto`, {
            method: "POST",
            body: formData
        });
        const data = await res.json();
        return data.ok ? data.result.photo.pop().file_id : ""; 
    } catch (err) {
        console.error("Upload Error:", err);
        return "";
    }
}
