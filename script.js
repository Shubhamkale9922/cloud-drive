// Supabase Configuration
const SUPABASE_URL = "https://nkmibduzcpzisjlokbjx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rbWliZHV6Y3B6aXNqbG9rYmp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NTc0ODAsImV4cCI6MjA3NzEzMzQ4MH0.8wY6w_ED6BInqmBZMX2vjqR31KegAGzpIdUkrCXtfYU";

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM Elements
const authModal = document.getElementById('authModal');
const openSignInBtn = document.getElementById('openSignIn');
const closeModalBtn = document.querySelector('.close-modal');
const getStartedBtn = document.getElementById('getStarted');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signupBtn = document.getElementById('signup');
const loginBtn = document.getElementById('login');
const logoutBtn = document.getElementById('logout');
const appSection = document.getElementById('app');
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const authDescription = document.getElementById('authDescription');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const authSuccess = document.getElementById('authSuccess');
const authError = document.getElementById('authError');

// Utility Functions
function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
    authError.style.display = 'none';
    authSuccess.style.display = 'none';
}

function clearErrors() {
    emailError.style.display = 'none';
    passwordError.style.display = 'none';
    authError.style.display = 'none';
    authSuccess.style.display = 'none';
}

function showAuthSuccess(message) {
    authSuccess.textContent = message;
    authSuccess.style.display = 'block';
    authError.style.display = 'none';
}

function showAuthError(message) {
    authError.textContent = message;
    authError.style.display = 'block';
    authSuccess.style.display = 'none';
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function setLoading(button, isLoading) {
    const textSpan = button.querySelector('span:first-child');
    const loadingSpan = button.querySelector('.loading');
    
    if (isLoading) {
        textSpan.classList.add('hidden');
        loadingSpan.classList.remove('hidden');
        button.disabled = true;
    } else {
        textSpan.classList.remove('hidden');
        loadingSpan.classList.add('hidden');
        button.disabled = false;
    }
}

function showMessage(element, message, isError = false) {
    element.textContent = message;
    element.style.color = isError ? '#e63946' : '#4cc9f0';
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
    }, 3000);
}

// Check authentication status on page load
async function checkAuth() {
    try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (data.session) {
            showApp();
        }
    } catch (error) {
        console.error('Auth check error:', error);
    }
}

// Show app section and hide landing page
function showApp() {
    authModal.style.display = 'none';
    appSection.classList.remove('hidden');
    document.querySelector('header').style.display = 'none';
    document.querySelector('.hero').style.display = 'none';
    document.querySelector('.features').style.display = 'none';
    document.querySelector('.pricing').style.display = 'none';
    document.querySelector('footer').style.marginTop = '0';
    listFiles();
    updateStorageUsage();
}

// Show landing page and hide app
function showLandingPage() {
    appSection.classList.add('hidden');
    document.querySelector('header').style.display = 'block';
    document.querySelector('.hero').style.display = 'block';
    document.querySelector('.features').style.display = 'block';
    document.querySelector('.pricing').style.display = 'block';
    document.querySelector('footer').style.marginTop = '';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Open auth modal
    openSignInBtn.addEventListener('click', () => {
        clearErrors();
        authDescription.textContent = 'Sign up or log in to access your personal cloud storage.';
        authModal.style.display = 'flex';
    });
    
    // Close auth modal
    closeModalBtn.addEventListener('click', () => {
        authModal.style.display = 'none';
        clearErrors();
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.style.display = 'none';
            clearErrors();
        }
    });
    
    // Get Started button
    getStartedBtn.addEventListener('click', () => {
        clearErrors();
        authModal.style.display = 'flex';
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Sign Up Function
signupBtn.addEventListener('click', async () => {
    clearErrors();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Validate inputs
    if (!email) {
        showError(emailError, 'Email is required');
        return;
    }
    
    if (!validateEmail(email)) {
        showError(emailError, 'Please enter a valid email address');
        return;
    }
    
    if (!password) {
        showError(passwordError, 'Password is required');
        return;
    }
    
    if (!validatePassword(password)) {
        showError(passwordError, 'Password must be at least 6 characters long');
        return;
    }
    
    setLoading(signupBtn, true);
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: window.location.origin
            }
        });
        
        if (error) throw error;
        
        if (data.user) {
            if (data.user.identities?.length === 0) {
                showAuthError('This email is already registered. Please log in instead.');
            } else {
                showAuthSuccess('✅ Sign-up successful! Please check your email to verify your account.');
                emailInput.value = '';
                passwordInput.value = '';
                
                // Auto-close modal after 3 seconds
                setTimeout(() => {
                    authModal.style.display = 'none';
                    clearErrors();
                }, 3000);
            }
        }
    } catch (error) {
        console.error('Signup error:', error);
        showAuthError(error.message || 'Sign-up failed. Please try again.');
    } finally {
        setLoading(signupBtn, false);
    }
});

// Login Function
loginBtn.addEventListener('click', async () => {
    clearErrors();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Validate inputs
    if (!email) {
        showError(emailError, 'Email is required');
        return;
    }
    
    if (!password) {
        showError(passwordError, 'Password is required');
        return;
    }
    
    setLoading(loginBtn, true);
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        if (data.user) {
            // Check if email is verified
            if (!data.user.email_confirmed_at) {
                showAuthError('Please verify your email before logging in. Check your inbox.');
                return;
            }
            
            // Successful login
            authModal.style.display = 'none';
            showApp();
            clearErrors();
        }
    } catch (error) {
        console.error('Login error:', error);
        showAuthError(error.message || 'Login failed. Please check your credentials.');
    } finally {
        setLoading(loginBtn, false);
    }
});

// Logout Function
logoutBtn.addEventListener('click', async () => {
    setLoading(logoutBtn, true);
    
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        showLandingPage();
        fileList.innerHTML = '';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Logout failed: ' + error.message);
    } finally {
        setLoading(logoutBtn, false);
    }
});

// Upload File Function
uploadBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a file first');
        return;
    }
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit. Please choose a smaller file.');
        return;
    }
    
    setLoading(uploadBtn, true);
    
    try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        
        const user = userData.user;
        if (!user) {
            alert('Please log in to upload files');
            return;
        }
        
        // Create user folder if it doesn't exist
        const filePath = `${user.id}/${Date.now()}_${file.name}`;
        
        const { error: uploadError } = await supabase.storage
            .from('userfiles')
            .upload(filePath, file);
        
        if (uploadError) {
            // If bucket doesn't exist, create it and retry
            if (uploadError.message.includes('bucket') || uploadError.message.includes('not found')) {
                // Try to create bucket and retry upload
                const { error: createError } = await supabase.storage.createBucket('userfiles', {
                    public: false,
                    fileSizeLimit: 10485760 // 10MB
                });
                
                if (createError) throw createError;
                
                // Retry upload after creating bucket
                const { error: retryError } = await supabase.st
