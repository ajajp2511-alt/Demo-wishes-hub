let allPosts = [], isLoginMode = true, isAdmin = false;

// UI & Auth
window.openAuth = () => document.getElementById('authModal').style.display = 'flex';
window.closeModal = (id) => document.getElementById(id).style.display = 'none';
window.toggleMode = () => {
    isLoginMode = !isLoginMode;
    document.getElementById('authT').innerText = isLoginMode ? "Login" : "Sign Up";
};

window.handleAuth = async () => {
    const e = document.getElementById('authEmail').value, p = document.getElementById('authPass').value;
    try {
        if(isLoginMode) await auth.signInWithEmailAndPassword(e, p);
        else await auth.createUserWithEmailAndPassword(e, p);
        location.reload();
    } catch(err) { alert(err.message); }
};

auth.onAuthStateChanged(user => {
    if(user) {
        document.getElementById('fBtn').style.display = 'block';
        document.getElementById('userBtnSection').innerHTML = `<button onclick="auth.signOut().then(()=>location.reload())" class="btn-outline" style="background:#ff4757; border:none;">Logout</button>`;
        if(user.email === 'admin@admin.com' || user.uid === 'fDp1cb1RAsWm8QfyuW2BDeYJyJw1') {
            isAdmin = true;
            document.getElementById('adminTools').style.display = 'block';
        }
    }
    fetchPosts();
});

// Publish Data (Unlimited Storage Feature)
window.publishData = async () => {
    const title = document.getElementById('wTitle').value;
    const text = document.getElementById('wText').value;
    const cat = document.getElementById('wCat').value;
    const file = document.getElementById('wFile').files[0];

    if(!title || !text) return alert("Title aur Text bhariye!");
    
    document.getElementById('pubBtn').innerText = "Uploading to Telegram...";
    const fileId = await uploadToTelegram(file); // From storage.js

    try {
        await db.collection("wishes").add({
            title, text, cat,
            telegram_id: fileId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert("Published successfully! ✅");
        location.reload();
    } catch (err) { alert(err.message); }
};

function fetchPosts() {
    db.collection("wishes").orderBy("createdAt", "desc").onSnapshot(snap => {
        allPosts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderPosts(allPosts);
    });
}

function renderPosts(data) {
    document.getElementById('mainGrid').innerHTML = data.map(d => `
        <div class="card">
            ${isAdmin ? `<button onclick="deletePost('${d.id}')" style="position:absolute; top:10px; right:10px; background:red; border:none; border-radius:50%; width:30px; height:30px; color:white; cursor:pointer;">🗑</button>` : ''}
            <img src="${d.telegram_id ? `https://api.telegram.org/file/bot${TG_BOT_TOKEN}/${d.telegram_id}` : 'https://placehold.co/600x400'}" class="card-img">
            <div class="card-body">
                <small style="color:var(--primary); font-weight:600;">${d.cat}</small>
                <h3>${d.title}</h3>
                <p id="t-${d.id}" style="white-space:pre-wrap;">${d.text}</p>
                <a href="https://wa.me/?text=${encodeURIComponent(d.text)}" target="_blank" class="btn-wa">WhatsApp Share</a>
                <button class="btn-copy" onclick="copyTxt('${d.id}')">📋 Copy</button>
            </div>
        </div>
    `).join('');
}

window.filterPosts = (cat, btn) => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderPosts(cat === 'All' ? allPosts : allPosts.filter(p => p.cat === cat));
};

window.copyTxt = (id) => {
    navigator.clipboard.writeText(document.getElementById('t-' + id).innerText).then(() => alert("Copied! ✅"));
};

window.deletePost = async (id) => {
    if(confirm("Delete?")) await db.collection("wishes").doc(id).delete();
};