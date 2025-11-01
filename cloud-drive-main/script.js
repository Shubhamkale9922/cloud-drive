// ✅ Supabase Configuration
const SUPABASE_URL = "https://nkmibduzcpzisjlokbjx.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rbWliZHV6Y3B6aXNqbG9rYmp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NTc0ODAsImV4cCI6MjA3NzEzMzQ4MH0.8wY6w_ED6BInqmBZMX2vjqR31KegAGzpIdUkrCXtfYU";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM Elements
const email = document.getElementById("email");
const password = document.getElementById("password");
const signupBtn = document.getElementById("signup");
const loginBtn = document.getElementById("login");
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");
const logoutBtn = document.getElementById("logout");

// 🧾 SIGN UP
signupBtn.onclick = async () => {
  const { error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
  });
  alert(error ? error.message : "✅ Sign-up successful! Verify your email.");
};

// 🔑 LOGIN
loginBtn.onclick = async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });
  if (error) return alert(error.message);
  document.getElementById("auth-card").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  listFiles();
};

// ☁️ UPLOAD FILE
uploadBtn.onclick = async () => {
  const user = (await supabase.auth.getUser()).data.user;
  const file = fileInput.files[0];
  if (!file) return alert("Select a file first");

  const filePath = `${user.id}/${file.name}`;

  const { error } = await supabase.storage
    .from("userfile")
    .upload(filePath, file, { upsert: true });

  if (error) return alert("❌ Upload failed: " + error.message);
  alert("✅ File uploaded successfully!");
  listFiles();
};

// 📜 LIST FILES
async function listFiles() {
  const user = (await supabase.auth.getUser()).data.user;
  const { data, error } = await supabase.storage
    .from("userfile")
    .list(user.id, { limit: 100, sortBy: { column: "name", order: "asc" } });

  if (error) return console.error("List Error:", error);

  fileList.innerHTML = "";

  if (!data || data.length === 0) {
    fileList.innerHTML = "<p>No files uploaded yet.</p>";
    return;
  }

  data
    .filter((file) => file.name !== ".emptyFolderPlaceholder")
    .forEach((file) => {
      const { data: publicUrl } = supabase.storage
        .from("userfile")
        .getPublicUrl(`${user.id}/${file.name}`);

      const li = document.createElement("li");
      li.setAttribute("data-filename", file.name);
      li.innerHTML = `
        <span>${file.name}</span>
        <div class="file-actions">
          <a href="${publicUrl.publicUrl}?t=${Date.now()}" target="_blank">View</a>
          <button onclick="deleteFile('${file.name}', this)">Delete</button>
        </div>
      `;
      fileList.appendChild(li);
    });
}

// ❌ DELETE FILE — instant UI remove
async function deleteFile(fileName, btn) {
  const user = (await supabase.auth.getUser()).data.user;
  btn.disabled = true;
  btn.textContent = "Deleting...";

  const { error } = await supabase.storage
    .from("userfile")
    .remove([`${user.id}/${fileName}`]);

  if (error) {
    alert("❌ Delete failed: " + error.message);
    btn.disabled = false;
    btn.textContent = "Delete";
    return;
  }

  // ✅ Instantly remove from screen
  const li = btn.closest("li");
  if (li) li.remove();

  alert("🗑️ File deleted successfully!");
}

// 🚪 LOGOUT
logoutBtn.onclick = async () => {
  await supabase.auth.signOut();
  document.getElementById("auth-card").classList.remove("hidden");
  document.getElementById("app").classList.add("hidden");
};
