// ============================================================
// SUPABASE CLIENT
// The URL must be your project URL (NOT the REST endpoint).
// Format: https://<your-project-ref>.supabase.co
// ============================================================
const { createClient } = supabase; // from the CDN script in index.html

const sb = createClient(
  "https://yrzhstrevycvchaozjrj.supabase.co",          // ← project URL (fixed: removed /rest/v1/)
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyemhzdHJldnljdmNoYW96anJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMzkyODYsImV4cCI6MjA5NzcxNTI4Nn0.NPzbARyaViAmcr4wMSxKHHE6BTCINgliPUlRwRJVDTI" // ← REPLACE THIS with your real anon/public key from Supabase dashboard → Settings → API
);

// NOTE: The key in your original file ("sb_secret_zfawyZxw_...") looks like a
// service-role or internal key, NOT the anon public key. Go to:
// Supabase Dashboard → Settings → API → "anon public" key
// and paste it above. Using the wrong key will cause auth to fail silently.

// ============================================================
// THEME TOGGLE
// ============================================================
const htmlEl = document.documentElement;
const themeBtn = document.getElementById("themeToggle");
const saved = localStorage.getItem("ryanbet-theme") || "dark";
if (saved === "light") {
  htmlEl.classList.remove("dark");
  htmlEl.classList.add("light");
  themeBtn.textContent = "☀️";
}
themeBtn.addEventListener("click", () => {
  const isLight = htmlEl.classList.contains("light");
  htmlEl.classList.toggle("dark", isLight);
  htmlEl.classList.toggle("light", !isLight);
  themeBtn.textContent = isLight ? "🌙" : "☀️";
  localStorage.setItem("ryanbet-theme", isLight ? "dark" : "light");
});

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
window.togglePass = togglePass; // expose to inline onclick handlers

// ============================================================
// PASSWORD STRENGTH
// ============================================================
document.getElementById("signupPass").addEventListener("input", function () {
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

// ============================================================
// AUTH MODAL
// ============================================================
const modal = document.getElementById("authModal");

function openModal(tab) {
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
  switchTab(tab || "login");
}
function closeModal() {
  modal.classList.remove("active");
  document.body.style.overflow = "";
}
function switchTab(tab) {
  document.getElementById("loginForm").style.display = tab === "login" ? "block" : "none";
  document.getElementById("signupForm").classList.toggle("hidden", tab !== "signup");

  if (tab === "login") {
    document.getElementById("tabLogin").style.cssText = "background:#e8232a;color:#fff;";
    document.getElementById("tabSignup").style.cssText = "background:var(--input-bg,#252836);color:#8a8fa8;";
  } else {
    document.getElementById("tabSignup").style.cssText = "background:#e8232a;color:#fff;";
    document.getElementById("tabLogin").style.cssText = "background:var(--input-bg,#252836);color:#8a8fa8;";
  }

  document.getElementById("modalSub").textContent =
    tab === "login" ? "Welcome back — your picks are waiting." : "Create your VIP account.";
  document.getElementById("loginError").classList.add("hidden");
  document.getElementById("signupError").classList.add("hidden");
}

// Expose modal functions to inline onclick attributes in HTML
window.openModal = openModal;
window.closeModal = closeModal;
window.switchTab = switchTab;

// ============================================================
// HELPER: Show Error
// ============================================================
function showError(el, msg) {
  el.textContent = msg;
  el.classList.remove("hidden");
  el.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ============================================================
// HELPER: Set Nav Flag
// ============================================================
function setNavFlag(flag) {
  if (!flag) return;
  const navFlag = document.getElementById("navFlag");
  navFlag.textContent = flag;
  navFlag.style.display = "block";
}

// ============================================================
// LOGIN HANDLER
// ============================================================
async function handleLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const pass  = document.getElementById("loginPass").value;
  const errEl = document.getElementById("loginError");

  if (!email)              { showError(errEl, "Please enter your email address."); return; }
  if (!email.includes("@")){ showError(errEl, "Please enter a valid email."); return; }
  if (!pass)               { showError(errEl, "Please enter your password."); return; }

  // Show loading state
  const btn = document.querySelector("#loginForm button[onclick='handleLogin()']");
  if (btn) { btn.textContent = "Signing in…"; btn.disabled = true; }

  const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });

  if (btn) { btn.textContent = "Log In to VIP"; btn.disabled = false; }

  if (error) {
    showError(errEl, "Invalid email or password. Please try again.");
    return;
  }

  // Fetch profile for flag
  const { data: profile } = await sb
    .from("users")
    .select("flag, first_name")
    .eq("id", data.user.id)
    .single();

  if (profile?.flag) setNavFlag(profile.flag);

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
  if (!email || !email.includes("@")) { showError(errEl, "Please enter a valid email."); return; }
  if (!countryEl.value)               { showError(errEl, "Please select your country."); return; }
  if (!pass || pass.length < 8)       { showError(errEl, "Password must be at least 8 characters."); return; }

  const selectedOption = countryEl.options[countryEl.selectedIndex];
  const flag = selectedOption ? selectedOption.text.split(" ")[0] : "🌍";

  // Show loading state
  const btn = document.querySelector("#signupForm button[onclick='handleSignup()']");
  if (btn) { btn.textContent = "Creating account…"; btn.disabled = true; }

  const { data, error } = await sb.auth.signUp({
    email,
    password: pass,
    options: {
      data: { first_name: firstName, last_name: lastName }
    }
  });

  if (btn) { btn.textContent = "Create Account"; btn.disabled = false; }

  if (error) {
    showError(errEl, error.message);
    return;
  }

  // Insert extra profile data into your users table
  // (Only runs if user was created — signUp returns a user even if email confirm is needed)
  if (data.user) {
    const { error: insertError } = await sb.from("users").insert({
      id: data.user.id,
      first_name: firstName,
      last_name: lastName,
      country: countryEl.value,
      flag,
      plan: "monthly"
    });

    // insertError here usually means the row already exists (e.g. duplicate signup).
    // We don't block the user for this.
    if (insertError) console.warn("Profile insert warning:", insertError.message);
  }

  setNavFlag(flag);
  closeModal();

  // If Supabase email confirmation is enabled, user won't be fully logged in yet.
  // Show a message or redirect to a confirm page.
  if (data.session) {
    // Session exists → email confirm is OFF → go straight to dashboard
    setTimeout(() => { window.location.href = "dashboard.html"; }, 200);
  } else {
    // Email confirm is ON → tell the user to check their inbox
    alert("✅ Account created! Please check your email to confirm your account, then log in.");
  }
}
window.handleSignup = handleSignup;

// ============================================================
// LOGOUT (called from dashboard or wherever needed)
// ============================================================
async function handleLogout() {
  await sb.auth.signOut();
  window.location.href = "index.html";
}
window.handleLogout = handleLogout;

// ============================================================
// NAV BUTTON LISTENERS
// ============================================================
document.getElementById("navLogin").addEventListener("click", () => openModal("login"));
document.getElementById("navSignup").addEventListener("click", () => openModal("signup"));
document.getElementById("modalClose").addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

// ============================================================
// RESTORE SESSION ON PAGE LOAD
// ============================================================
sb.auth.getSession().then(({ data: { session } }) => {
  if (!session) return;
  sb.from("users")
    .select("flag, first_name")
    .eq("id", session.user.id)
    .single()
    .then(({ data: profile }) => {
      if (profile?.flag) setNavFlag(profile.flag);
    });
});

// ============================================================
// SPORT FILTER
// ============================================================
const sportPills    = document.querySelectorAll(".sport-pill");
const newsCards     = document.querySelectorAll(".news-card");
const noNewsMsg     = document.getElementById("noNewsMsg");
const activeSportLabel = document.getElementById("activeSportLabel");

sportPills.forEach((pill) => {
  pill.addEventListener("click", () => {
    sportPills.forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");

    const sport = pill.dataset.sport;
    activeSportLabel.textContent = sport === "ALL" ? "" : `— ${sport}`;

    let visible = 0;
    newsCards.forEach((card) => {
      if (sport === "ALL" || card.dataset.sport === sport) {
        card.style.display = "";
        visible++;
      } else {
        card.style.display = "none";
      }
    });

    noNewsMsg.classList.toggle("hidden", visible > 0);
    document.getElementById("news").scrollIntoView({ behavior: "smooth" });
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
let toastIndex = 0;
let toastTimeout;

function showWinToast() {
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
    const delay = 8000 + Math.random() * 7000;
    setTimeout(showWinToast, delay);
  }, 5000);
}

setTimeout(showWinToast, 3000);

toast.addEventListener("click", () => {
  toast.classList.remove("show");
  clearTimeout(toastTimeout);
  setTimeout(showWinToast, 10000 + Math.random() * 5000);
});

// ============================================================
// MOBILE MENU
// ============================================================
const mMenu = document.getElementById("mobileMenu");
document.getElementById("ham").addEventListener("click", () => {
  mMenu.classList.toggle("hidden");
  mMenu.classList.toggle("flex");
});
document.querySelectorAll(".mobile-link").forEach((a) =>
  a.addEventListener("click", () => {
    mMenu.classList.add("hidden");
    mMenu.classList.remove("flex");
  })
);

// ============================================================
// FAQ
// ============================================================
document.querySelectorAll(".faq-q").forEach((btn) => {
  btn.addEventListener("click", () => {
    const item = btn.parentElement;
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
    const t = document.querySelector(a.getAttribute("href"));
    if (t) {
      e.preventDefault();
      t.scrollIntoView({ behavior: "smooth" });
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
document.getElementById("newsUpdated").textContent =
  "Updated " +
  new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
  " · " +
  new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });