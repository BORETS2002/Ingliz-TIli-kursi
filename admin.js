const API_BASE_URL =
  window.API_BASE_URL ||
  (typeof location !== "undefined" && location.hostname === "localhost"
    ? "http://localhost:3000"
    : "");

const TOKEN_KEY = "speakinghub_admin_token";
let ADMIN_TOKEN = localStorage.getItem(TOKEN_KEY);

const DEFAULT_CONTENT = {
  heroTitle: "Speaking Hub by Teacher Shahlo · Online ingliz tili kurslari",
  heroSubtitle:
    "Teacher Shahlo bilan 0 dan CEFR / IELTS darajalarigacha. Kuchli nazorat, rag'bat va 100% pulni qaytarish kafolati.",
  heroMain: "Ingliz tilida",
  heroMainAccent: "erkin gaplashishni",
  heroMainSuffix: "boshlang",
  heroHighlight3: "Online format – telefoningizdan o'qishingiz mumkin",
  primaryCta: "Darsga yozilish",
  heroName: "Teacher Shahlo",
  heroExp: "1,5 yillik real sinovdan o'tgan mualliflik dasturi",
  heroImage: "/imgs/shahlo.jpg",
  aboutTitle: "Teacher Shahlo haqida",
  aboutSubtitle:
    "Talabchan, lekin iliq muhitda o'rgatadigan, natijaga yo'naltirilgan murabbiy.",
  coursesTitle: "Asosiy kurslar",
  coursesSubtitle: "O'zingizga mos o'quv dasturini tanlang.",
  bonusesTitle: "Bonuslar va qo'shimcha imkoniyatlar",
  bonusesSubtitle: "Kurs davomida sizni qo'llab-quvvatlaydigan qo'shimcha resurslar.",
  registerTitle: "Ariza qoldiring",
  registerSubtitle:
    "Ma'lumotingizni qoldiring, kuratorimiz siz bilan bog'lanib barcha savollarga javob beradi.",
  course1Title: "Speaking Hub (0 dan B2 gacha)",
  course1Tagline: "0 dan B2 darajagacha 2 oyda chiqishni xohlaydiganlar uchun.",
  course1Price: "hozircha kelishiladi",
  course1Cta: "Shu kursga yozilish",
  course2Title: "English 1+ (B1 dan C1 / IELTS)",
  course2Tagline: "CEFR Multilevel va IELTS ga tayyorlovchi chuqurlashtirilgan dastur.",
  course2Price: "hozircha kelishiladi",
  course2Cta: "Shu kursga yozilish",
  bonus1Title: "Extra Speaking sessiyalar",
  bonus1Body:
    "Haftalik qo'shimcha speaking klub, real hayotdagi mavzular bo'yicha erkin suhbatlar.",
  bonus2Title: "Materiallar va shpargalkalar",
  bonus2Body:
    "Grammatik jadvallar, vocabulary to'plamlari va imtihonlar uchun mini-guide'lar.",
  bonus3Title: "Progress report",
  bonus3Body:
    "Har oy sizning rivojlanish bo'yicha qisqa hisobot va tavsiyalar.",
  bonus4Title: "Yopiq community",
  bonus4Body:
    "Telegram / WhatsApp community, savollar berish, speaking partner topish imkoniyati.",
  footerBrand: "Speaking Hub by Teacher Shahlo.",
  footerRights: "Barcha huquqlar himoyalangan.",
  footerNote:
    "Sayt ilhom manbasi: zamonaviy online ta'lim platformalari, minimalizm va feminen rang palitrasi.",
  themeAccent: "#f36fa4",
  themeAccentSecondary: "#9d7bff",
  bgFrom: "#241530",
  bgTo: "#0b0c11",
  themeBg:
    "radial-gradient(circle at top left, #241530 0, #0b0c11 46%, #050509 100%)",
  waLink: "https://t.me/teacher_shahlo_admin",
  waLabel: "WhatsApp orqali yozish",
};

async function apiFetch(path, options = {}) {
  const headers = {
    Accept: "application/json",
    ...options.headers,
  };
  if (ADMIN_TOKEN) {
    headers.Authorization = `Bearer ${ADMIN_TOKEN}`;
  }
  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (res.status === 401) {
    logout();
    throw new Error("Sessiya muddati tugadi. Iltimos qayta kiring.");
  }
  return res;
}

async function fetchRegistrations() {
  const res = await apiFetch("/api/admin/registrations");
  if (!res.ok) throw new Error("Failed to load registrations");
  const data = await res.json();
  return data.items || [];
}

async function fetchContent() {
  const res = await apiFetch("/api/content");
  if (!res.ok) throw new Error("Failed to load content");
  const data = await res.json();
  return data.entries || {};
}

async function saveContentToServer(entries) {
  const res = await apiFetch("/api/admin/content", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entries }),
  });
  if (!res.ok) throw new Error("Failed to save content");
}

function formatDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("uz-UZ", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

async function renderRegistrationsTable() {
  const tbody = document.querySelector("#registrationsTable tbody");
  if (!tbody) return;
  try {
    const items = await fetchRegistrations();
    tbody.innerHTML = "";
    items.forEach((item, idx) => {
      const tr = document.createElement("tr");
      const status = item.status ?? "";
      tr.dataset.id = item.id ?? "";
      
      const statusClass = status ? `status-${status}` : "";
      if (statusClass) tr.classList.add(statusClass);

      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${item.firstName ?? ""}</td>
        <td>${item.lastName ?? ""}</td>
        <td><span class="pill">${item.phone ?? ""}</span></td>
        <td>${item.course ?? ""}</td>
        <td style="max-width:200px; overflow:hidden; text-overflow:ellipsis;">${item.note || ""}</td>
        <td>${formatDate(item.createdAt)}</td>
        <td>
          <div style="display:flex; gap:4px">
            <button class="status-btn status-btn--check" data-action="check" title="Tekshirildi">✓</button>
            <button class="status-btn status-btn--time" data-action="time" title="Kutilmoqda">◷</button>
            <button class="status-btn status-btn--not" data-action="not" title="Rad etildi">✕</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    console.error(e);
  }
}

async function updateRegistrationStatus(id, status) {
  try {
    await apiFetch(`/api/admin/registrations/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await renderRegistrationsTable();
  } catch (e) {
    alert(e.message);
  }
}

function setupTabs() {
  const tabs = document.querySelectorAll(".admin-tab");
  const sections = {
    registrations: document.getElementById("tab-registrations"),
    content: document.getElementById("tab-content"),
  };
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabId = tab.getAttribute("data-tab");
      tabs.forEach((t) => t.classList.remove("admin-tab--active"));
      tab.classList.add("admin-tab--active");
      Object.entries(sections).forEach(([id, section]) => {
        if (!section) return;
        section.classList.toggle("admin-section--active", id === tabId);
      });
    });
  });
}

function showAdminToast(el, message, type = "success") {
  if (!el) return;
  el.textContent = message;
  el.className = "toast " + (type === "error" ? "toast--error" : "toast--success");
  setTimeout(() => {
    el.className = "toast";
    el.textContent = "";
  }, 4000);
}

function populateContentFields() {
  const content = window.__ADMIN_CONTENT__ || {};
  const setVal = (id, key) => {
    const el = document.getElementById(id);
    if (el) el.value = content[key] || DEFAULT_CONTENT[key] || "";
  };
  
  const fields = [
    ["fieldHeroTitle", "heroTitle"], ["fieldHeroSubtitle", "heroSubtitle"],
    ["fieldHeroMain", "heroMain"], ["fieldHeroMainAccent", "heroMainAccent"],
    ["fieldHeroMainSuffix", "heroMainSuffix"], ["fieldHeroHighlight3", "heroHighlight3"],
    ["fieldPrimaryCta", "primaryCta"], ["fieldHeroName", "heroName"],
    ["fieldHeroExp", "heroExp"], ["fieldHeroImage", "heroImage"],
    ["fieldAboutTitle", "aboutTitle"], ["fieldAboutSubtitle", "aboutSubtitle"],
    ["fieldCoursesTitle", "coursesTitle"], ["fieldCoursesSubtitle", "coursesSubtitle"],
    ["fieldBonusesTitle", "bonusesTitle"], ["fieldBonusesSubtitle", "bonusesSubtitle"],
    ["fieldRegisterTitle", "registerTitle"], ["fieldRegisterSubtitle", "registerSubtitle"],
    ["fieldCourse1Title", "course1Title"], ["fieldCourse1Tagline", "course1Tagline"],
    ["fieldCourse1Price", "course1Price"], ["fieldCourse1Cta", "course1Cta"],
    ["fieldCourse2Title", "course2Title"], ["fieldCourse2Tagline", "course2Tagline"],
    ["fieldCourse2Price", "course2Price"], ["fieldCourse2Cta", "course2Cta"],
    ["fieldBonus1Title", "bonus1Title"], ["fieldBonus1Body", "bonus1Body"],
    ["fieldBonus2Title", "bonus2Title"], ["fieldBonus2Body", "bonus2Body"],
    ["fieldBonus3Title", "bonus3Title"], ["fieldBonus3Body", "bonus3Body"],
    ["fieldBonus4Title", "bonus4Title"], ["fieldBonus4Body", "bonus4Body"],
    ["fieldFooterBrand", "footerBrand"], ["fieldFooterRights", "footerRights"],
    ["fieldFooterNote", "footerNote"], ["fieldWaLink", "waLink"], ["fieldWaLabel", "waLabel"]
  ];

  fields.forEach(([id, key]) => setVal(id, key));
  
  if (document.getElementById("fieldAccent")) 
    document.getElementById("fieldAccent").value = content.themeAccent || DEFAULT_CONTENT.themeAccent;
  if (document.getElementById("fieldAccentSecondary"))
    document.getElementById("fieldAccentSecondary").value = content.themeAccentSecondary || DEFAULT_CONTENT.themeAccentSecondary;
  if (document.getElementById("fieldBgFrom"))
    document.getElementById("fieldBgFrom").value = content.bgFrom || DEFAULT_CONTENT.bgFrom;
  if (document.getElementById("fieldBgTo"))
    document.getElementById("fieldBgTo").value = content.bgTo || DEFAULT_CONTENT.bgTo;
}

function readContent() {
  const current = window.__ADMIN_CONTENT__ || DEFAULT_CONTENT;
  const next = { ...current };
  
  const fields = [
    ["fieldHeroTitle", "heroTitle"], ["fieldHeroSubtitle", "heroSubtitle"],
    ["fieldHeroMain", "heroMain"], ["fieldHeroMainAccent", "heroMainAccent"],
    ["fieldHeroMainSuffix", "heroMainSuffix"], ["fieldHeroHighlight3", "heroHighlight3"],
    ["fieldPrimaryCta", "primaryCta"], ["fieldHeroName", "heroName"],
    ["fieldHeroExp", "heroExp"], ["fieldHeroImage", "heroImage"],
    ["fieldAboutTitle", "aboutTitle"], ["fieldAboutSubtitle", "aboutSubtitle"],
    ["fieldCoursesTitle", "coursesTitle"], ["fieldCoursesSubtitle", "coursesSubtitle"],
    ["fieldBonusesTitle", "bonusesTitle"], ["fieldBonusesSubtitle", "bonusesSubtitle"],
    ["fieldRegisterTitle", "registerTitle"], ["fieldRegisterSubtitle", "registerSubtitle"],
    ["fieldCourse1Title", "course1Title"], ["fieldCourse1Tagline", "course1Tagline"],
    ["fieldCourse1Price", "course1Price"], ["fieldCourse1Cta", "course1Cta"],
    ["fieldCourse2Title", "course2Title"], ["fieldCourse2Tagline", "course2Tagline"],
    ["fieldCourse2Price", "course2Price"], ["fieldCourse2Cta", "course2Cta"],
    ["fieldBonus1Title", "bonus1Title"], ["fieldBonus1Body", "bonus1Body"],
    ["fieldBonus2Title", "bonus2Title"], ["fieldBonus2Body", "bonus2Body"],
    ["fieldBonus3Title", "bonus3Title"], ["fieldBonus3Body", "bonus3Body"],
    ["fieldBonus4Title", "bonus4Title"], ["fieldBonus4Body", "bonus4Body"],
    ["fieldFooterBrand", "footerBrand"], ["fieldFooterRights", "footerRights"],
    ["fieldFooterNote", "footerNote"], ["fieldWaLink", "waLink"], ["fieldWaLabel", "waLabel"],
    ["fieldAccent", "themeAccent"], ["fieldAccentSecondary", "themeAccentSecondary"],
    ["fieldBgFrom", "bgFrom"], ["fieldBgTo", "bgTo"]
  ];

  fields.forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) next[key] = el.value.trim() || DEFAULT_CONTENT[key];
  });
  
  next.themeBg = `radial-gradient(circle at top left, ${next.bgFrom} 0, ${next.bgTo} 46%, #050509 100%)`;
  return next;
}

function logout() {
  ADMIN_TOKEN = null;
  localStorage.removeItem(TOKEN_KEY);
  location.reload(); // Refresh to clear state and show login
}

async function init() {
  const loader = document.getElementById("admin-loader");
  const shell = document.getElementById("admin-shell");
  const loginSection = document.getElementById("admin-login");
  const panelSection = document.getElementById("admin-panel");
  const logoutBtn = document.getElementById("logoutBtn");

  if (ADMIN_TOKEN) {
    try {
      const content = await fetchContent();
      window.__ADMIN_CONTENT__ = content;
      
      loginSection.style.display = "none";
      panelSection.style.display = "block";
      logoutBtn.style.display = "inline-flex";
      
      await renderRegistrationsTable();
      setupTabs();
      populateContentFields();
    } catch (e) {
      console.error("Auth check failed", e);
      ADMIN_TOKEN = null;
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  // Final UI reveal
  loader.style.opacity = "0";
  setTimeout(() => {
    loader.style.visibility = "hidden";
    shell.classList.add("admin-shell--ready");
  }, 400);

  // Event Listeners
  document.getElementById("adminLoginBtn")?.addEventListener("click", async () => {
    const pwd = document.getElementById("adminPassword")?.value;
    const loginMsg = document.getElementById("adminLoginMsg");
    if (!pwd) return showAdminToast(loginMsg, "Parolni kiriting", "error");

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin", password: pwd }),
      });
      if (!res.ok) throw new Error("Parol noto'g'ri");
      const data = await res.json();
      ADMIN_TOKEN = data.token;
      localStorage.setItem(TOKEN_KEY, ADMIN_TOKEN);
      location.reload();
    } catch (e) {
      showAdminToast(loginMsg, e.message, "error");
    }
  });

  logoutBtn?.addEventListener("click", logout);

  document.getElementById("registrationsTable")?.addEventListener("click", (e) => {
    const target = e.target;
    const action = target.getAttribute("data-action");
    if (!action) return;
    const id = target.closest("tr")?.dataset.id;
    if (id) updateRegistrationStatus(id, action);
  });

  document.getElementById("saveContentBtn")?.addEventListener("click", async () => {
    const msg = document.getElementById("contentMsg");
    try {
      const next = readContent();
      await saveContentToServer(next);
      window.__ADMIN_CONTENT__ = next;
      showAdminToast(msg, "Muvaffaqiyatli saqlandi!");
    } catch (e) {
      showAdminToast(msg, "Xatolik: " + e.message, "error");
    }
  });

  document.getElementById("resetContentBtn")?.addEventListener("click", async () => {
    if (!confirm("Haqiqatan ham barcha o'zgarishlarni o'chirib, asli holiga qaytarmoqchimisiz?")) return;
    const msg = document.getElementById("contentMsg");
    try {
      await saveContentToServer(DEFAULT_CONTENT);
      window.__ADMIN_CONTENT__ = DEFAULT_CONTENT;
      populateContentFields();
      showAdminToast(msg, "Asli holiga qaytarildi");
    } catch (e) {
      showAdminToast(msg, e.message, "error");
    }
  });
}

document.addEventListener("DOMContentLoaded", init);
