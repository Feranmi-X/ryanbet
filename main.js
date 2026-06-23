// ============================================================
// SUPABASE CLIENT
// ============================================================
const { createClient } = supabase;

const sb = createClient(
  "https://yrzhstrevycvchaozjrj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyemhzdHJldnljdmNoYW96anJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMzkyODYsImV4cCI6MjA5NzcxNTI4Nn0.NPzbARyaViAmcr4wMSxKHHE6BTCINgliPUlRwRJVDTI"
);

// ============================================================
// THEME TOGGLE
// ============================================================
const htmlEl = document.documentElement;
const themeBtn = document.getElementById("themeToggle");
const saved = localStorage.getItem("ryanbet-theme") || "dark";
if (saved === "light") {
  htmlEl.classList.remove("dark");
  htmlEl.classList.add("light");
  if (themeBtn) themeBtn.textContent = "☀️";
}
if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    const isLight = htmlEl.classList.contains("light");
    htmlEl.classList.toggle("dark", isLight);
    htmlEl.classList.toggle("light", !isLight);
    themeBtn.textContent = isLight ? "🌙" : "☀️";
    localStorage.setItem("ryanbet-theme", isLight ? "dark" : "light");
  });
}

// ============================================================
// PASSWORD TOGGLE
// ============================================================
function togglePass(id, btn) {
  const input = document.getElementById(id);
  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "HIDE";
  } else {
    input.type = "password";
    btn.textContent = "SHOW";
  }
}
window.togglePass = togglePass;

// ============================================================
// PASSWORD STRENGTH
// ============================================================
const signupPassEl = document.getElementById("signupPass");
if (signupPassEl) {
  signupPassEl.addEventListener("input", function () {
    const val = this.value;
    const bar = document.getElementById("passBar");
    let strength = 0;
    if (val.length >= 8) strength++;
    if (/[A-Z]/.test(val)) strength++;
    if (/[0-9]/.test(val)) strength++;
    if (/[^A-Za-z0-9]/.test(val)) strength++;
    const colors = ["#e8232a", "#f4c430", "#2ecc8a", "#2ecc8a"];
    const widths = ["25%", "50%", "75%", "100%"];
    bar.style.width = val.length ? widths[strength - 1] || "10%" : "0%";
    bar.style.background = val.length ? colors[strength - 1] || "#e8232a" : "transparent";
  });
}

// ============================================================
// AUTH MODAL
// ============================================================
const modal = document.getElementById("authModal");

function openModal(tab) {
  if (!modal) return;
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
  switchTab(tab || "login");
}
function closeModal() {
  if (!modal) return;
  modal.classList.remove("active");
  document.body.style.overflow = "";
}
function switchTab(tab) {
  const loginForm  = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  if (!loginForm || !signupForm) return;

  loginForm.style.display = tab === "login" ? "block" : "none";
  signupForm.classList.toggle("hidden", tab !== "signup");

  const tabLogin  = document.getElementById("tabLogin");
  const tabSignup = document.getElementById("tabSignup");
  if (tab === "login") {
    if (tabLogin)  tabLogin.style.cssText  = "background:#e8232a;color:#fff;";
    if (tabSignup) tabSignup.style.cssText = "background:var(--input-bg,#252836);color:#8a8fa8;";
  } else {
    if (tabSignup) tabSignup.style.cssText = "background:#e8232a;color:#fff;";
    if (tabLogin)  tabLogin.style.cssText  = "background:var(--input-bg,#252836);color:#8a8fa8;";
  }

  const modalSub = document.getElementById("modalSub");
  if (modalSub) {
    modalSub.textContent = tab === "login"
      ? "Welcome back — your picks are waiting."
      : "Create your VIP account.";
  }

  const loginError  = document.getElementById("loginError");
  const signupError = document.getElementById("signupError");
  if (loginError)  loginError.classList.add("hidden");
  if (signupError) signupError.classList.add("hidden");
}

window.openModal  = openModal;
window.closeModal = closeModal;
window.switchTab  = switchTab;

// ============================================================
// HELPER: Show Error
// ============================================================
function showError(el, msg) {
  el.textContent = msg;
  el.classList.remove("hidden");
  el.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ============================================================
// NAV: Update for logged-in user
// Uses cloneNode to wipe old listeners before attaching new ones,
// so logout + reload always restores the original Log In / Join VIP state.
// ============================================================
function updateNavForLoggedInUser(profile, user) {
  const navFlag        = document.getElementById("navFlag");
  const navAdminLi     = document.getElementById("navAdminLi");
  const navAdminMobile = document.getElementById("navAdminMobile");

  // Show country flag
  if (navFlag && profile?.flag) {
    navFlag.textContent  = profile.flag;
    navFlag.style.display = "block";
  }

  // Show admin link only for admins
  if (profile?.is_admin) {
    if (navAdminLi)     navAdminLi.classList.remove("hidden");
    if (navAdminMobile) navAdminMobile.classList.remove("hidden");
  }

  // Clone both buttons to strip ALL previously attached event listeners
  const navLogin  = document.getElementById("navLogin");
  const navSignup = document.getElementById("navSignup");
  if (!navLogin || !navSignup) return;

  const freshLogin  = navLogin.cloneNode(true);
  const freshSignup = navSignup.cloneNode(true);
  navLogin.replaceWith(freshLogin);
  navSignup.replaceWith(freshSignup);

  // Style & wire up the fresh buttons
  freshLogin.style.display     = "block";
  freshLogin.textContent       = profile?.first_name ? `Hi,  👋` : "Dashboard";
  freshLogin.style.color       = "#2ecc8a";
  freshLogin.style.borderColor = "rgba(46,204,138,0.3)";
  freshLogin.addEventListener("click", () => { window.location.href = "dashboard.html"; });

  freshSignup.textContent       = "Dashboard →";
  freshSignup.style.background  = "#2ecc8a";
  freshSignup.style.color       = "#0c0e14";
  freshSignup.style.border      = "none";
  freshSignup.addEventListener("click", () => { window.location.href = "dashboard.html"; });
}

function setNavFlag(flag) {
  if (!flag) return;
  const navFlag = document.getElementById("navFlag");
  if (navFlag) {
    navFlag.textContent   = flag;
    navFlag.style.display = "block";
  }
}

// ============================================================
// LOGIN HANDLER
// ============================================================
async function handleLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const pass  = document.getElementById("loginPass").value;
  const errEl = document.getElementById("loginError");

  if (!email)               { showError(errEl, "Please enter your email address."); return; }
  if (!email.includes("@")) { showError(errEl, "Please enter a valid email address."); return; }
  if (!pass)                { showError(errEl, "Please enter your password."); return; }

  const btn = document.querySelector("#loginForm button[onclick='handleLogin()']");
  if (btn) { btn.textContent = "Signing in…"; btn.disabled = true; }

  const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });

  if (btn) { btn.textContent = "Log In to VIP"; btn.disabled = false; }

  if (error) {
    // Surface the real Supabase message to help diagnose (email not confirmed, etc.)
    const msg = error.message?.toLowerCase().includes("email")
      ? "Please confirm your email address before logging in."
      : "Invalid email or password. Please try again.";
    showError(errEl, msg);
    return;
  }

  const { data: profile } = await sb
    .from("users")
    .select("flag, first_name, is_admin")
    .eq("id", data.user.id)
    .single();

  if (profile?.flag) setNavFlag(profile.flag);
  updateNavForLoggedInUser(profile, data.user);

  closeModal();
  setTimeout(() => { window.location.href = "dashboard.html"; }, 200);
}
window.handleLogin = handleLogin;

// ============================================================
// SIGNUP HANDLER
// ============================================================
async function handleSignup() {
  const firstName = document.getElementById("signupFirstName").value.trim();
  const lastName  = document.getElementById("signupLastName").value.trim();
  const email     = document.getElementById("signupEmail").value.trim();
  const countryEl = document.getElementById("signupCountry");
  const pass      = document.getElementById("signupPass").value;
  const errEl     = document.getElementById("signupError");

  if (!firstName)                     { showError(errEl, "Please enter your first name."); return; }
  if (!lastName)                      { showError(errEl, "Please enter your last name."); return; }
  if (!email || !email.includes("@")) { showError(errEl, "Please enter a valid email address."); return; }
  if (!countryEl.value)               { showError(errEl, "Please select your country."); return; }
  if (!pass || pass.length < 8)       { showError(errEl, "Password must be at least 8 characters."); return; }

  const selectedOption = countryEl.options[countryEl.selectedIndex];
  const flag = selectedOption ? selectedOption.text.split(" ")[0] : "🌍";

  const btn = document.querySelector("#signupForm button[onclick='handleSignup()']");
  if (btn) { btn.textContent = "Creating account…"; btn.disabled = true; }

  const { data, error } = await sb.auth.signUp({
    email,
    password: pass,
    options: { data: { first_name: firstName, last_name: lastName } },
  });

  if (btn) { btn.textContent = "Create Account"; btn.disabled = false; }

  if (error) {
    showError(errEl, error.message);
    return;
  }

  if (data.user) {
    const { error: insertError } = await sb.from("users").insert({
      id:         data.user.id,
      first_name: firstName,
      last_name:  lastName,
      country:    countryEl.value,
      flag,
      plan:       "monthly",
      balance:    0,
      deposited:  0,
    });
    if (insertError) console.warn("Profile insert warning:", insertError.message);
  }

  setNavFlag(flag);
  closeModal();

  if (data.session) {
    setTimeout(() => { window.location.href = "dashboard.html"; }, 200);
  } else {
    alert("✅ Account created! Please check your email to confirm your account, then log in.");
  }
}
window.handleSignup = handleSignup;

// ============================================================
// LOGOUT
// ============================================================
async function handleLogout() {
  await sb.auth.signOut();
  window.location.href = "index.html";
}
window.handleLogout = handleLogout;

// ============================================================
// NAV BUTTON LISTENERS (initial page load — logged-out state)
// These run once. If the user is logged in, updateNavForLoggedInUser
// clones the buttons and attaches dashboard listeners instead.
// ============================================================
const navLoginBtn   = document.getElementById("navLogin");
const navSignupBtn  = document.getElementById("navSignup");
const modalCloseBtn = document.getElementById("modalClose");

if (navLoginBtn)   navLoginBtn.addEventListener("click",  () => openModal("login"));
if (navSignupBtn)  navSignupBtn.addEventListener("click", () => openModal("signup"));
if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
if (modal) {
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
}
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

// ============================================================
// RESTORE SESSION ON PAGE LOAD
// If already logged in, update nav without requiring another login.
// ============================================================
sb.auth.getSession().then(async ({ data: { session } }) => {
  if (!session) return;

  const { data: profile } = await sb
    .from("users")
    .select("flag, first_name, is_admin")
    .eq("id", session.user.id)
    .single();

  updateNavForLoggedInUser(profile, session.user);
});

// ============================================================
// SPORT FILTER
// ============================================================
const sportPills       = document.querySelectorAll(".sport-pill");
const newsCards        = document.querySelectorAll(".news-card");
const noNewsMsg        = document.getElementById("noNewsMsg");
const activeSportLabel = document.getElementById("activeSportLabel");

sportPills.forEach((pill) => {
  pill.addEventListener("click", () => {
    sportPills.forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");

    const sport = pill.dataset.sport;
    if (activeSportLabel) {
      activeSportLabel.textContent = sport === "ALL" ? "" : `— ${sport}`;
    }

    let visible = 0;
    newsCards.forEach((card) => {
      if (sport === "ALL" || card.dataset.sport === sport) {
        card.style.display = "";
        visible++;
      } else {
        card.style.display = "none";
      }
    });

    if (noNewsMsg) noNewsMsg.classList.toggle("hidden", visible > 0);
    const newsSection = document.getElementById("news");
    if (newsSection) newsSection.scrollIntoView({ behavior: "smooth" });
  });
});

// ============================================================
// WIN NOTIFICATION TOASTS
// ============================================================
const winNotifications = [
  { initials: "MJ", name: "Marcus J.",  amount: "+$4,000", book: "Just won on FanDuel 🎉" },
  { initials: "KL", name: "Kevin L.",   amount: "+$2,750", book: "Just cashed on DraftKings 🔥" },
  { initials: "SR", name: "Sofia R.",   amount: "+$1,200", book: "Parlay hit on BetMGM 🏆" },
  { initials: "DW", name: "DeShawn W.", amount: "+$3,800", book: "NBA pick hit on FanDuel 💰" },
  { initials: "TR", name: "Tyler R.",   amount: "+$890",   book: "MLB run line — Caesars ⚾" },
  { initials: "AM", name: "Andre M.",   amount: "+$5,500", book: "NHL puck line — Bet365 🏒" },
  { initials: "JB", name: "James B.",   amount: "+$1,650", book: "NFL spread — DraftKings 🏈" },
  { initials: "CN", name: "Carlos N.",  amount: "+$3,200", book: "Parlay hit — FanDuel 🎯" },
];

const toast = document.getElementById("winToast");
let toastIndex   = 0;
let toastTimeout;

function showWinToast() {
  if (!toast) return;
  const n = winNotifications[toastIndex % winNotifications.length];
  document.getElementById("toastAvatar").textContent = n.initials;
  document.getElementById("toastName").textContent   = n.name;
  document.getElementById("toastAmount").textContent = n.amount;
  document.getElementById("toastBook").textContent   = n.book;
  toastIndex++;

  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(showWinToast, 8000 + Math.random() * 7000);
  }, 5000);
}

if (toast) {
  setTimeout(showWinToast, 3000);
  toast.addEventListener("click", () => {
    toast.classList.remove("show");
    clearTimeout(toastTimeout);
    setTimeout(showWinToast, 10000 + Math.random() * 5000);
  });
}

// ============================================================
// MOBILE MENU
// ============================================================
const mMenu = document.getElementById("mobileMenu");
const hamBtn = document.getElementById("ham");
if (hamBtn && mMenu) {
  hamBtn.addEventListener("click", () => {
    mMenu.classList.toggle("hidden");
    mMenu.classList.toggle("flex");
  });
  document.querySelectorAll(".mobile-link").forEach((a) =>
    a.addEventListener("click", () => {
      mMenu.classList.add("hidden");
      mMenu.classList.remove("flex");
    })
  );
}

// ============================================================
// FAQ
// ============================================================
document.querySelectorAll(".faq-q").forEach((btn) => {
  btn.addEventListener("click", () => {
    const item   = btn.parentElement;
    const isOpen = item.classList.contains("open");
    document.querySelectorAll(".faq-item").forEach((i) => i.classList.remove("open"));
    if (!isOpen) item.classList.add("open");
  });
});

// ============================================================
// SMOOTH SCROLL
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const target = document.querySelector(a.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// ============================================================
// LAZY SECTIONS (scroll fade-in)
// ============================================================
const lazySections = document.querySelectorAll(".lazy-section");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
);
lazySections.forEach((el) => observer.observe(el));

// ============================================================
// NEWS TIMESTAMP
// ============================================================
const newsUpdatedEl = document.getElementById("newsUpdated");
if (newsUpdatedEl) {
  newsUpdatedEl.textContent =
    "Updated " +
    new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " · " +
    new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}