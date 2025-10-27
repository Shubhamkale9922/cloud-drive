// 🔧 Replace with your own Supabase details
const SUPABASE_URL = "https://nkmibduzcpzisjlokbjx.supabase.co"; // your Supabase URL
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rbWliZHV6Y3B6aXNqbG9rYmp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NTc0ODAsImV4cCI6MjA3NzEzMzQ4MH0.8wY6w_ED6BInqmBZMX2vjqR31KegAGzpIdUkrCXtfYU"; // your anon/public key

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 🧩 Sign Up (Create new account)
async function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    alert("❌ " + error.message);
  } else {
    alert("✅ Account created! You can now log in.");
  }
}

// 🧩 Login
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    alert("❌ " + error.message);
  } else {
    alert("✅ Logged in!");
    document.getElementById("fileSection").style.display = "block";
    listFiles();
  }
}

// 🧩 Logout
async function logout() {
  await supabase.auth.signOut();
  alert("🚪 Logged out!");
  document.getElementById("fileSection").style.display = "none";
}

// 🧩 Upload File
async function uploadFile() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  if (!file) return alert("Please select a file first!");

  const user = (await supabase.auth.getUser()).data.user;
  const filePath = `${user.id}/${file.name}`;

  const { data, error } = await supabase.storage.from("files").upload(filePath, file);

  if (error) {
    alert("❌ " + error.message);
  } else {
    alert("✅ File uploaded!");
    listFiles();
  }
}

// 🧩 List Files
async function listFiles() {
  const user = (await supabase.auth.getUser()).data.user;
  const { data, error } = await supabase.storage.from("files").list(user.id + "/");

  const fileList = document.getElementById("fileList");
  fileList.innerHTML = "";

  if (error) {
    fileList.innerHTML = "❌ " + error.message;
    return;
  }

  if (!data || data.length === 0) {
    fileList.innerHTML = "No files uploaded yet.";
    return;
  }

  data.forEach(async (file) => {
    const { data: urlData } = await supabase.storage
      .from("files")
      .getPublicUrl(user.id + "/" + file.name);
    const a = document.createElement("a");
    a.href = urlData.publicUrl;
    a.textContent = file.name;
    a.target = "_blank";
    const div = document.createElement("div");
    div.appendChild(a);
    fileList.appendChild(div);
  });
}
