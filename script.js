// NAVBAR: mobile toggle + smooth scroll
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger");
  const navInner = document.querySelector(".nav-inner");
  const navLinks = document.querySelectorAll(".nav-links a");

  if (hamburger && navInner) {
    hamburger.addEventListener("click", () => {
      const open = navInner.classList.toggle("nav-open");
      hamburger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // close mobile menu after clicking a link and smooth scroll
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      // allow normal anchor behavior then close menu
      const target = link.getAttribute("href");
      if (target && target.startsWith("#")) {
        e.preventDefault();
        document
          .querySelector(target)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      navInner.classList.remove("nav-open");
      hamburger?.setAttribute("aria-expanded", "false");
    });
  });
});

// Replace previous slider logic with feed -> modal draggable slider
(function () {
  // gather feed items
  const feed = document.getElementById("feed");
  const feedItems = feed ? Array.from(feed.querySelectorAll(".feed-item")) : [];
  const modal = document.getElementById("media-modal");
  const track = modal?.querySelector(".modal-track");
  const closeBtn = modal?.querySelector(".modal-close");
  const prevBtn = modal?.querySelector(".modal-prev");
  const nextBtn = modal?.querySelector(".modal-next");

  if (!modal || !track || feedItems.length === 0) return;

  // build slides inside modal-track from feed items
  const slides = feedItems.map((el) => {
    const slide = document.createElement("div");
    slide.className = "modal-slide";
    const media = el.querySelector("img,video").cloneNode(true);
    // ensure video in modal has controls
    if (media.tagName === "VIDEO") {
      media.controls = true;
      media.autoplay = false;
    }
    slide.appendChild(media);
    track.appendChild(slide);
    return slide;
  });

  let current = 0;
  function showModal(index) {
    current = index;
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    updateTrack();
    document.body.style.overflow = "hidden";
  }
  function hideModal() {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  function updateTrack(animate = true) {
    if (animate) track.style.transition = "transform 300ms ease";
    else track.style.transition = "none";
    track.style.transform = `translateX(-${current * 100}%)`;
  }

  // click feed -> open modal at that index
  feedItems.forEach((fi, idx) => {
    fi.addEventListener("click", () => showModal(idx));
  });

  // controls
  closeBtn.addEventListener("click", hideModal);
  prevBtn.addEventListener("click", () => {
    current = (current - 1 + slides.length) % slides.length;
    updateTrack();
  });
  nextBtn.addEventListener("click", () => {
    current = (current + 1) % slides.length;
    updateTrack();
  });

  // keyboard
  document.addEventListener("keydown", (e) => {
    if (modal.classList.contains("hidden")) return;
    if (e.key === "Escape") hideModal();
    if (e.key === "ArrowLeft") prevBtn.click();
    if (e.key === "ArrowRight") nextBtn.click();
  });

  // draggable / swipe support
  let pointer = { down: false, startX: 0, currentX: 0, startTranslate: 0 };
  track.addEventListener("pointerdown", (e) => {
    track.setPointerCapture(e.pointerId);
    pointer.down = true;
    pointer.startX = e.clientX;
    // computed current translate in px
    const rect = track.getBoundingClientRect();
    pointer.startTranslate = -current * rect.width;
    track.classList.add("grabbing");
    track.style.transition = "none";
  });
  track.addEventListener("pointermove", (e) => {
    if (!pointer.down) return;
    pointer.currentX = e.clientX;
    const dx = pointer.currentX - pointer.startX;
    const rect = track.getBoundingClientRect();
    const translate = pointer.startTranslate + dx;
    const percent = (translate / rect.width) * 100;
    track.style.transform = `translateX(${percent}%)`;
  });
  track.addEventListener("pointerup", (e) => {
    if (!pointer.down) return;
    pointer.down = false;
    track.classList.remove("grabbing");
    const dx = e.clientX - pointer.startX;
    const threshold = 80; // px to change slide
    if (dx > threshold) {
      current = Math.max(0, current - 1);
    } else if (dx < -threshold) {
      current = Math.min(slides.length - 1, current + 1);
    }
    updateTrack();
  });
  track.addEventListener("pointercancel", () => {
    pointer.down = false;
    track.classList.remove("grabbing");
    updateTrack();
  });

  // close when clicking backdrop
  modal.addEventListener("click", (e) => {
    if (e.target === modal) hideModal();
  });
})();
