const STORAGE_KEYS = {
  registrations: "speakinghub_registrations",
  content: "speakinghub_site_content",
};

function getStoredRegistrations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.registrations);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to read registrations", e);
    return [];
  }
}

function saveRegistration(entry) {
  const list = getStoredRegistrations();
  list.push({
    ...entry,
    id: entry.id || Date.now().toString(),
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem(STORAGE_KEYS.registrations, JSON.stringify(list));
}

function applyDynamicContent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.content);
    if (!raw) return;
    const content = JSON.parse(raw);
    if (!content || typeof content !== "object") return;

    const mapping = {
      heroTitle: '[data-content-key="heroTitle"]',
      heroSubtitle: '[data-content-key="heroSubtitle"]',
      heroMain: '[data-content-key="heroMain"]',
      heroMainAccent: '[data-content-key="heroMainAccent"]',
      heroMainSuffix: '[data-content-key="heroMainSuffix"]',
      heroHighlight3: '[data-content-key="heroHighlight3"]',
      primaryCta: '[data-content-key="primaryCta"]',
      heroName: '[data-content-key="heroName"]',
      heroExp: '[data-content-key="heroExp"]',
      aboutTitle: '[data-content-key="aboutTitle"]',
      aboutSubtitle: '[data-content-key="aboutSubtitle"]',
      about1Title: '[data-content-key="about1Title"]',
      about1Body: '[data-content-key="about1Body"]',
      about2Title: '[data-content-key="about2Title"]',
      about2Body: '[data-content-key="about2Body"]',
      about3Title: '[data-content-key="about3Title"]',
      about3Body: '[data-content-key="about3Body"]',
      about4Title: '[data-content-key="about4Title"]',
      about4Body: '[data-content-key="about4Body"]',
      coursesTitle: '[data-content-key="coursesTitle"]',
      coursesSubtitle: '[data-content-key="coursesSubtitle"]',
      course1Title: '[data-content-key="course1Title"]',
      course1Tagline: '[data-content-key="course1Tagline"]',
      course1Price: '[data-content-key="course1Price"]',
      course1Cta: '[data-content-key="course1Cta"]',
      course2Title: '[data-content-key="course2Title"]',
      course2Tagline: '[data-content-key="course2Tagline"]',
      course2Price: '[data-content-key="course2Price"]',
      course2Cta: '[data-content-key="course2Cta"]',
      bonusesTitle: '[data-content-key="bonusesTitle"]',
      bonusesSubtitle: '[data-content-key="bonusesSubtitle"]',
      bonus1Title: '[data-content-key="bonus1Title"]',
      bonus1Body: '[data-content-key="bonus1Body"]',
      bonus2Title: '[data-content-key="bonus2Title"]',
      bonus2Body: '[data-content-key="bonus2Body"]',
      bonus3Title: '[data-content-key="bonus3Title"]',
      bonus3Body: '[data-content-key="bonus3Body"]',
      bonus4Title: '[data-content-key="bonus4Title"]',
      bonus4Body: '[data-content-key="bonus4Body"]',
      registerTitle: '[data-content-key="registerTitle"]',
      registerSubtitle: '[data-content-key="registerSubtitle"]',
      formSubmitText: '[data-content-key="formSubmitText"]',
      footerBrand: '[data-content-key="footerBrand"]',
      footerRights: '[data-content-key="footerRights"]',
      footerNote: '[data-content-key="footerNote"]',
      waLabel: '[data-content-key="waLabel"]',
    };

    Object.entries(mapping).forEach(([key, selector]) => {
      const el = document.querySelector(selector);
      if (!el || !content[key]) return;
      el.textContent = content[key];
    });

    if (content.heroImage) {
      const img = document.querySelector(".hero-photo img");
      if (img) {
        img.setAttribute("src", content.heroImage);
      }
    }

    if (content.waLink) {
      const wa = document.getElementById("wa-link");
      if (wa) {
        wa.setAttribute("href", content.waLink);
      }
    }

    const root = document.documentElement;
    if (content.themeAccent) {
      root.style.setProperty("--accent", content.themeAccent);
    }
    if (content.themeAccentSecondary) {
      root.style.setProperty("--accent-secondary", content.themeAccentSecondary);
    }
    if (content.themeBg) {
      document.body.style.background = content.themeBg;
    } else if (content.bgFrom || content.bgTo) {
      const from = content.bgFrom || "#241530";
      const to = content.bgTo || "#0b0c11";
      document.body.style.background = `radial-gradient(circle at top left, ${from} 0, ${to} 46%, #050509 100%)`;
    }
  } catch (e) {
    console.error("Failed to apply dynamic content", e);
  }
}

function scrollToForm() {
  const el = document.getElementById("register");
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function openCourseInForm(courseLabel) {
  const select = document.getElementById("course");
  if (select) {
    select.value = courseLabel;
  }
  scrollToForm();
}

function showToast(message, type = "success") {
  const toast = document.getElementById("form-toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = "toast " + (type === "error" ? "toast--error" : "toast--success");
  setTimeout(() => {
    toast.className = "toast";
    toast.textContent = "";
  }, 4500);
}

function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const firstName = form.firstName.value.trim();
  const lastName = form.lastName.value.trim();
  const phone = form.phone.value.trim();
  const course = form.course.value;
  const note = form.note.value.trim();

  if (!firstName || !lastName || !phone || !course) {
    showToast("Iltimos, barcha majburiy maydonlarni to'ldiring.", "error");
    return;
  }
  if (!/^[0-9]{9}$/.test(phone)) {
    showToast("Telefon raqamni 9 ta raqamda kiriting (masalan: 901234567).", "error");
    return;
  }

  saveRegistration({
    id: Date.now().toString(),
    firstName,
    lastName,
    phone: "+998" + phone,
    course,
    note,
    status: "new",
  });

  form.reset();
  showToast("Arizangiz qabul qilindi! Kuratorimiz tez orada bog'lanadi.", "success");
}

document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  applyDynamicContent();

  const form = document.getElementById("lead-form");
  if (form) {
    form.addEventListener("submit", handleFormSubmit);
  }
});

