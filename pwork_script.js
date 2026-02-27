const menu = document.querySelector(".menu");
const btn = document.querySelector(".menu-btn");
const panel = document.querySelector(".menu-panel");

function setOpen(isOpen) {
  menu.classList.toggle("open", isOpen);
  btn.setAttribute("aria-expanded", String(isOpen));

  if (isOpen) {
    // Focus first item for keyboard users
    const firstLink = panel.querySelector("a");
  } 
}

btn.addEventListener("click", (e) => {
  e.stopPropagation();
  const isOpen = menu.classList.contains("open");
  setOpen(!isOpen);
});

document.addEventListener("click", (e) => {
  if (!menu.contains(e.target)) setOpen(false);
});

document.addEventListener("keydown", (e) => {
  const isOpen = menu.classList.contains("open");
  if (!isOpen) return;

  if (e.key === "Escape") {
    e.preventDefault();
    setOpen(false);
    return;
  }

  // Arrow key navigation within menu links
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    const links = Array.from(panel.querySelectorAll("a"));
    const currentIndex = links.indexOf(document.activeElement);
    const delta = e.key === "ArrowDown" ? 1 : -1;
    const nextIndex = currentIndex === -1
      ? 0
      : (currentIndex + delta + links.length) % links.length;
    links[nextIndex]?.focus();
  }
});

// Optional: close menu after clicking a link
panel.addEventListener("click", (e) => {
  const link = e.target.closest("a");
  if (link) setOpen(false);
});

// -------------- Modal Logic ----------------
const modal = document.getElementById("projectModal");
const modalPanel = modal.querySelector(".modal_panel");
const img = modal.querySelector(".modal_img");
const titleEl = modal.querySelector(".modal_title");
const subtitleEl = modal.querySelector(".modal_subtitle");
const creativeList = modal.querySelector("[data-creative]");
const technicalList = modal.querySelector("[data-technical]");
const liveLink = modal.querySelector("[data-live]");
const githubLink = modal.querySelector("[data-github]");

let lastFocusedEl = null;

function setList(ul, items) {
  ul.innerHTML = "";
  items.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    ul.appendChild(li);
  });
}

function openModal(fromEl) {
  lastFocusedEl = fromEl;

  const data = fromEl.dataset;

  titleEl.textContent = data.title || "Project";
  subtitleEl.textContent = data.subtitle || "";

  // Image
  img.src = data.image || "";
  img.alt = `${titleEl.textContent} screenshot`;

  // Lists
  const creative = (data.creative || "").split("|").filter(Boolean);
  const technical = (data.technical || "").split("|").filter(Boolean);
  setList(creativeList, creative);
  setList(technicalList, technical);

  // Links (hide if missing)
  if (data.live) {
    liveLink.href = data.live;
    liveLink.style.display = "";
  } else {
    liveLink.style.display = "none";
  }

  if(githubLink) {
    if (data.github) {
        githubLink.href = data.github;
        githubLink.style.display = "";
    } else {
        githubLink.style.display = "none";
    }
  }

  // Show modal
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  // Move focus into modal
  modalPanel.focus();
}

function closeModal() {
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");

  // Clear image src to avoid background loading if you want
  img.src = "";

  // Return focus
  if (lastFocusedEl) lastFocusedEl.focus();
}

// Open: any element with data-modal="project"
document.addEventListener("click", (e) => {
  const opener = e.target.closest('[data-modal="project"]');
  if (opener) openModal(opener);

  // Close: anything with data-close="true"
  const closer = e.target.closest("[data-close='true']");
  if (closer && modal.getAttribute("aria-hidden") === "false") {
    closeModal();
  }
});

// Esc closes
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false") {
    closeModal();
  }
});
