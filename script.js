// Initialize Supabase client
const SUPABASE_URL = "https://nkmibduzcpzisjlokbjx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rbWliZHV6Y3B6aXNqbG9rYmp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NTc0ODAsImV4cCI6MjA3NzEzMzQ4MH0.8wY6w_ED6BInqmBZMX2vjqR31KegAGzpIdUkrCXtfYU";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const email = document.getElementById('email');
const password = document.getElementById('password');
const signupBtn = document.getElementById('signup');
const loginBtn = document.getElementById('login');
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const logoutBtn = document.getElementById('logout');

// SIGN UP
signupBtn.onclick = async () => {
  const { error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value
  });
  alert(error ? error.message : "✅ Sign-up successful! Check your email for confirmation.");
};

// LOGIN
loginBtn.onclick = async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  });
  if (error) return alert(error.message);
  document.getElementById('auth').style.display = "none";
  document.getElementById('app').style.display = "block";
  listFiles();
};

// UPLOAD FILE
uploadBtn.onclick = async () => {
  const file = fileInput.files[0];
  if (!file) return alert("Select a file first");
  const { data, error } = await supabase.storage
    .from('userfiles')
    .upload(`uploads/${file.name}`, file);
  if (error) alert(error.message);
  else {
    alert("✅ Uploaded!");
    listFiles();
  }
};

// LIST FILES
async function listFiles() {
  const { data } = await supabase.storage.from('userfiles').list('uploads');
  fileList.innerHTML = "";
  data?.forEach(async (file) => {
    const { data: publicUrl } = supabase.storage
      .from('userfiles')
      .getPublicUrl(`uploads/${file.name}`);
    const li = document.createElement('li');
    li.innerHTML = `<a href="${publicUrl.publicUrl}" target="_blank">${file.name}</a>`;
    fileList.appendChild(li);
  });
}

// LOGOUT
logoutBtn.onclick = async () => {
  await supabase.auth.signOut();
  document.getElementById('auth').style.display = "block";
  document.getElementById('app').style.display = "none";
};
