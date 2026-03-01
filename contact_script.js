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


// Resend function
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#contact-form");
  const statusEl = document.querySelector("#form-status");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Grab fields exactly as defined in your HTML
    const nameEl = form.querySelector('[name="client-name"]');
    const emailEl = form.querySelector('[name="client-email"]');
    const messageEl = form.querySelector('[name="client-message"]');
    const honeypotEl = form.querySelector('[name="website"]');

    const payload = {
      name: (nameEl?.value || "").trim(),
      email: (emailEl?.value || "").trim(),
      message: (messageEl?.value || "").trim(),
      website: (honeypotEl?.value || "").trim(), // honeypot
    };

    // UI: feedback
    if (statusEl) statusEl.textContent = "Sending…";

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        if (statusEl) statusEl.textContent = "✅ Sent. I’ll reply within 24 hours.";
        form.reset();
      } else {
        const text = await res.text().catch(() => "");
        if (statusEl) statusEl.textContent = `❌ Failed to send. ${text || "Please try again."}`;
      }
    } catch (err) {
      if (statusEl) statusEl.textContent = "❌ Network error. Please try again.";
    }
  });
});