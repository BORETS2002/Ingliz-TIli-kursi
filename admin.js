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

async function fetchRegistrations() {
  if (!ADMIN_TOKEN) return [];
  const res = await fetch(`${API_BASE_URL}/api/admin/registrations`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    },
  });
  if (!res.ok) throw new Error("Failed to load registrations");
  const data = await res.json();
  return data.items || [];
}

async function fetchContent() {
  const res = await fetch(`${API_BASE_URL}/api/content`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Failed to load content");
  const data = await res.json();
  return data.entries || {};
}

async function saveContentToServer(entries) {
  if (!ADMIN_TOKEN) throw new Error("No admin token");
  const res = await fetch(`${API_BASE_URL}/api/admin/content`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    },
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
  const items = await fetchRegistrations();
  tbody.innerHTML = "";
  items.forEach((item, idx) => {
    const tr = document.createElement("tr");
    const status = item.status ?? "";
    if (status === "check") tr.classList.add("status-check");
    if (status === "time") tr.classList.add("status-time");
    if (status === "not") tr.classList.add("status-not");
    tr.dataset.id = item.id ?? "";
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${item.firstName ?? ""}</td>
      <td>${item.lastName ?? ""}</td>
      <td><span class="pill">${item.phone ?? ""}</span></td>
      <td>${item.course ?? ""}</td>
      <td>${item.note ? item.note.slice(0, 60) : ""}</td>
      <td>${formatDate(item.createdAt)}</td>
      <td>
        <button class="status-btn status-btn--check" data-action="check">check</button>
        <button class="status-btn status-btn--time" data-action="time">time</button>
        <button class="status-btn status-btn--not" data-action="not">not</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function updateRegistrationStatus(id, status) {
  if (!ADMIN_TOKEN) return;
  await fetch(`${API_BASE_URL}/api/admin/registrations/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    },
    body: JSON.stringify({ status }),
  });
  await renderRegistrationsTable();
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
  }, 3500);
}

function populateContentFields() {
  const content = window.__ADMIN_CONTENT__ || {};
  const heroTitle = document.getElementById("fieldHeroTitle");
  const heroSubtitle = document.getElementById("fieldHeroSubtitle");
  if (heroTitle && content.heroTitle) heroTitle.value = content.heroTitle;
  if (heroSubtitle && content.heroSubtitle) heroSubtitle.value = content.heroSubtitle;
  const setVal = (id, key) => {
    const el = document.getElementById(id);
    if (el && content[key]) el.value = content[key];
  };
  setVal("fieldHeroMain", "heroMain");
  setVal("fieldHeroMainAccent", "heroMainAccent");
  setVal("fieldHeroMainSuffix", "heroMainSuffix");
  setVal("fieldHeroHighlight3", "heroHighlight3");
  setVal("fieldPrimaryCta", "primaryCta");
  setVal("fieldHeroName", "heroName");
  setVal("fieldHeroExp", "heroExp");
  setVal("fieldHeroImage", "heroImage");
  setVal("fieldAboutTitle", "aboutTitle");
  setVal("fieldAboutSubtitle", "aboutSubtitle");
  setVal("fieldCoursesTitle", "coursesTitle");
  setVal("fieldCoursesSubtitle", "coursesSubtitle");
  setVal("fieldBonusesTitle", "bonusesTitle");
  setVal("fieldBonusesSubtitle", "bonusesSubtitle");
  setVal("fieldRegisterTitle", "registerTitle");
  setVal("fieldRegisterSubtitle", "registerSubtitle");
  setVal("fieldCourse1Title", "course1Title");
  setVal("fieldCourse1Tagline", "course1Tagline");
  setVal("fieldCourse1Price", "course1Price");
  setVal("fieldCourse1Cta", "course1Cta");
  setVal("fieldCourse2Title", "course2Title");
  setVal("fieldCourse2Tagline", "course2Tagline");
  setVal("fieldCourse2Price", "course2Price");
  setVal("fieldCourse2Cta", "course2Cta");
  setVal("fieldBonus1Title", "bonus1Title");
  setVal("fieldBonus1Body", "bonus1Body");
  setVal("fieldBonus2Title", "bonus2Title");
  setVal("fieldBonus2Body", "bonus2Body");
  setVal("fieldBonus3Title", "bonus3Title");
  setVal("fieldBonus3Body", "bonus3Body");
  setVal("fieldBonus4Title", "bonus4Title");
  setVal("fieldBonus4Body", "bonus4Body");
  setVal("fieldFooterBrand", "footerBrand");
  setVal("fieldFooterRights", "footerRights");
  setVal("fieldFooterNote", "footerNote");
  const accent = document.getElementById("fieldAccent");
  if (accent) accent.value = content.themeAccent || DEFAULT_CONTENT.themeAccent;
  const accent2 = document.getElementById("fieldAccentSecondary");
  if (accent2)
    accent2.value = content.themeAccentSecondary || DEFAULT_CONTENT.themeAccentSecondary;
  const bgFrom = document.getElementById("fieldBgFrom");
  if (bgFrom) bgFrom.value = content.bgFrom || DEFAULT_CONTENT.bgFrom;
  const bgTo = document.getElementById("fieldBgTo");
  if (bgTo) bgTo.value = content.bgTo || DEFAULT_CONTENT.bgTo;
  setVal("fieldWaLink", "waLink");
  setVal("fieldWaLabel", "waLabel");
}

document.addEventListener("DOMContentLoaded", () => {
  const loginSection = document.getElementById("admin-login");
  const panelSection = document.getElementById("admin-panel");
  const loginBtn = document.getElementById("adminLoginBtn");
  const loginMsg = document.getElementById("adminLoginMsg");

  loginBtn?.addEventListener("click", async () => {
    const pwdInput = document.getElementById("adminPassword");
    const pwd = pwdInput?.value ?? "";
    if (!pwd) {
      showAdminToast(loginMsg, "Parolni kiriting.", "error");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ username: "admin", password: pwd }),
      });
      if (!res.ok) {
        showAdminToast(loginMsg, "Noto'g'ri parol yoki login.", "error");
        return;
      }
      const data = await res.json();
      ADMIN_TOKEN = data.token;
      localStorage.setItem(TOKEN_KEY, ADMIN_TOKEN);
      showDashboard();
    } catch (e) {
      console.error(e);
      showAdminToast(loginMsg, "Server bilan bog'lanib bo'lmadi.", "error");
    }
  });

  async function showDashboard() {
    if (loginSection) loginSection.style.display = "none";
    if (panelSection) panelSection.style.display = "block";
    try {
      const content = await fetchContent();
      window.__ADMIN_CONTENT__ = content;
      await renderRegistrationsTable();
      setupTabs();
      populateContentFields();
    } catch (e) {
      console.error("Dashboard yuklashda xatolik:", e);
      // Agar token muddati o'tgan bo'lsa yoki noto'g'ri bo'lsa
      if (e.message.includes("401") || e.message.includes("token")) {
        logout();
      }
    }
  }

  function logout() {
    ADMIN_TOKEN = null;
    localStorage.removeItem(TOKEN_KEY);
    if (loginSection) loginSection.style.display = "block";
    if (panelSection) panelSection.style.display = "none";
  }

  // Sahifa yuklanganda token bo'lsa avtomatik dashboardni ko'rsatish
  if (ADMIN_TOKEN) {
    showDashboard();
  }

  const table = document.getElementById("registrationsTable");
  table?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const action = target.getAttribute("data-action");
    if (!action) return;
    const row = target.closest("tr");
    if (!row) return;
    const id = row.dataset.id;
    if (!id) return;
    if (action === "check") updateRegistrationStatus(id, "check");
    if (action === "time") updateRegistrationStatus(id, "time");
    if (action === "not") updateRegistrationStatus(id, "not");
  });

  const saveContentBtn = document.getElementById("saveContentBtn");
  const contentMsg = document.getElementById("contentMsg");
  saveContentBtn?.addEventListener("click", async () => {
    const heroTitle = document.getElementById("fieldHeroTitle")?.value.trim();
    const heroSubtitle = document.getElementById("fieldHeroSubtitle")?.value.trim();
    const current = readContent();
    const next = {
      ...current,
      heroTitle: heroTitle || current.heroTitle,
      heroSubtitle: heroSubtitle || current.heroSubtitle,
      heroMain: document.getElementById("fieldHeroMain")?.value.trim() || current.heroMain,
      heroMainAccent:
        document.getElementById("fieldHeroMainAccent")?.value.trim() || current.heroMainAccent,
      heroMainSuffix:
        document.getElementById("fieldHeroMainSuffix")?.value.trim() || current.heroMainSuffix,
      heroHighlight3:
        document.getElementById("fieldHeroHighlight3")?.value.trim() || current.heroHighlight3,
      primaryCta: document.getElementById("fieldPrimaryCta")?.value.trim() || current.primaryCta,
      heroName: document.getElementById("fieldHeroName")?.value.trim() || current.heroName,
      heroExp: document.getElementById("fieldHeroExp")?.value.trim() || current.heroExp,
      heroImage: document.getElementById("fieldHeroImage")?.value.trim() || current.heroImage,
      aboutTitle: document.getElementById("fieldAboutTitle")?.value.trim() || current.aboutTitle,
      aboutSubtitle:
        document.getElementById("fieldAboutSubtitle")?.value.trim() || current.aboutSubtitle,
      coursesTitle:
        document.getElementById("fieldCoursesTitle")?.value.trim() || current.coursesTitle,
      coursesSubtitle:
        document.getElementById("fieldCoursesSubtitle")?.value.trim() || current.coursesSubtitle,
      bonusesTitle:
        document.getElementById("fieldBonusesTitle")?.value.trim() || current.bonusesTitle,
      bonusesSubtitle:
        document.getElementById("fieldBonusesSubtitle")?.value.trim() || current.bonusesSubtitle,
      registerTitle:
        document.getElementById("fieldRegisterTitle")?.value.trim() || current.registerTitle,
      registerSubtitle:
        document.getElementById("fieldRegisterSubtitle")?.value.trim() || current.registerSubtitle,
      course1Title:
        document.getElementById("fieldCourse1Title")?.value.trim() || current.course1Title,
      course1Tagline:
        document.getElementById("fieldCourse1Tagline")?.value.trim() || current.course1Tagline,
      course1Price:
        document.getElementById("fieldCourse1Price")?.value.trim() || current.course1Price,
      course1Cta: document.getElementById("fieldCourse1Cta")?.value.trim() || current.course1Cta,
      course2Title:
        document.getElementById("fieldCourse2Title")?.value.trim() || current.course2Title,
      course2Tagline:
        document.getElementById("fieldCourse2Tagline")?.value.trim() || current.course2Tagline,
      course2Price:
        document.getElementById("fieldCourse2Price")?.value.trim() || current.course2Price,
      course2Cta: document.getElementById("fieldCourse2Cta")?.value.trim() || current.course2Cta,
      bonus1Title:
        document.getElementById("fieldBonus1Title")?.value.trim() || current.bonus1Title,
      bonus1Body: document.getElementById("fieldBonus1Body")?.value.trim() || current.bonus1Body,
      bonus2Title:
        document.getElementById("fieldBonus2Title")?.value.trim() || current.bonus2Title,
      bonus2Body: document.getElementById("fieldBonus2Body")?.value.trim() || current.bonus2Body,
      bonus3Title:
        document.getElementById("fieldBonus3Title")?.value.trim() || current.bonus3Title,
      bonus3Body: document.getElementById("fieldBonus3Body")?.value.trim() || current.bonus3Body,
      bonus4Title:
        document.getElementById("fieldBonus4Title")?.value.trim() || current.bonus4Title,
      bonus4Body: document.getElementById("fieldBonus4Body")?.value.trim() || current.bonus4Body,
      footerBrand:
        document.getElementById("fieldFooterBrand")?.value.trim() || current.footerBrand,
      footerRights:
        document.getElementById("fieldFooterRights")?.value.trim() || current.footerRights,
      footerNote:
        document.getElementById("fieldFooterNote")?.value.trim() || current.footerNote,
      themeAccent:
        document.getElementById("fieldAccent")?.value.trim() ||
        current.themeAccent ||
        DEFAULT_CONTENT.themeAccent,
      themeAccentSecondary:
        document.getElementById("fieldAccentSecondary")?.value.trim() ||
        current.themeAccentSecondary ||
        DEFAULT_CONTENT.themeAccentSecondary,
      bgFrom:
        document.getElementById("fieldBgFrom")?.value.trim() ||
        current.bgFrom ||
        DEFAULT_CONTENT.bgFrom,
      bgTo:
        document.getElementById("fieldBgTo")?.value.trim() ||
        current.bgTo ||
        DEFAULT_CONTENT.bgTo,
      waLink:
        document.getElementById("fieldWaLink")?.value.trim() ||
        current.waLink ||
        DEFAULT_CONTENT.waLink,
      waLabel:
        document.getElementById("fieldWaLabel")?.value.trim() ||
        current.waLabel ||
        DEFAULT_CONTENT.waLabel,
    };
    next.themeBg = `radial-gradient(circle at top left, ${next.bgFrom} 0, ${next.bgTo} 46%, #050509 100%)`;
    try {
      await saveContentToServer(next);
      window.__ADMIN_CONTENT__ = next;
      showAdminToast(contentMsg, "Saqlangan. Asosiy saytni yangilab ko'ring.", "success");
    } catch (e) {
      console.error(e);
      showAdminToast(contentMsg, "Saqlab bo'lmadi. Keyinroq urinib ko'ring.", "error");
    }
  });

  const resetBtn = document.getElementById("resetContentBtn");
  resetBtn?.addEventListener("click", async () => {
    try {
      await saveContentToServer(DEFAULT_CONTENT);
      window.__ADMIN_CONTENT__ = DEFAULT_CONTENT;
      populateContentFields();
      showAdminToast(
        contentMsg,
        "Barcha kontent va ranglar asl holatiga qaytarildi. Asosiy saytni yangilang.",
        "success"
      );
    } catch (e) {
      console.error(e);
      showAdminToast(contentMsg, "Qaytarib bo'lmadi. Keyinroq urinib ko'ring.", "error");
    }
  });
});

