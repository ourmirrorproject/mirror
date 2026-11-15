(function () {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  function mountPlayer(el) {
    const id = el.getAttribute("data-youtube");
    const title = el.getAttribute("data-title") || "YouTube video";
    if (!id) return;
    const iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?autoplay=1&rel=0";
    iframe.title = title;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.setAttribute("loading", "lazy");
    el.classList.add("is-playing");
    const btn = el.querySelector(".yt-play");
    const img = el.querySelector("img");
    if (btn) btn.remove();
    if (img) img.remove();
    el.appendChild(iframe);
  }

  document.querySelectorAll(".yt").forEach((el) => {
    const btn = el.querySelector(".yt-play");
    if (!btn) return;
    btn.addEventListener("click", () => mountPlayer(el));
  });

  async function handleForm(form, successId, button) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = button || form.querySelector('button[type="submit"]');
      const original = btn ? btn.textContent : "";
      if (btn) {
        btn.textContent = "Sending…";
        btn.disabled = true;
      }
      try {
        const res = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          form.hidden = true;
          const ok = document.getElementById(successId);
          if (ok) ok.hidden = false;
        } else {
          throw new Error("Request failed");
        }
      } catch (err) {
        if (btn) {
          btn.textContent = "Try again";
          btn.disabled = false;
        }
        alert("Something went wrong. Please try again.");
      } finally {
        if (btn && !form.hidden) btn.textContent = original || btn.textContent;
      }
    });
  }

  const story = document.getElementById("story-form");
  if (story) handleForm(story, "form-success", document.getElementById("submit-btn"));
  const news = document.getElementById("newsletter-form");
  if (news) handleForm(news, "newsletter-success");

  document.querySelectorAll("button.fact-flip").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".fact-card");
      const open = card.classList.toggle("is-flipped");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      const back = btn.querySelector(".fact-back");
      const front = btn.querySelector(".fact-front");
      if (back) back.setAttribute("aria-hidden", open ? "false" : "true");
      if (front) front.setAttribute("aria-hidden", open ? "true" : "false");
    });
    const back = btn.querySelector(".fact-back");
    if (back) back.setAttribute("aria-hidden", "true");
  });

document.querySelectorAll(".bts-player").forEach((player) => {
    const video = player.querySelector("video");
    const playBtn = player.querySelector(".bts-play");
    const muteBtn = player.querySelector(".bts-mute");
    if (!video || !playBtn) return;

    const setPlaying = (on) => {
      player.classList.toggle("is-playing", on);
      playBtn.setAttribute("aria-hidden", on ? "true" : "false");
    };

    const pauseOthers = () => {
      document.querySelectorAll(".bts-player").forEach((other) => {
        if (other === player) return;
        const v = other.querySelector("video");
        if (v && !v.paused) v.pause();
        other.classList.remove("is-playing");
      });
    };

    const playMuted = async () => {
      pauseOthers();
      video.muted = true;
      if (muteBtn) {
        muteBtn.setAttribute("aria-pressed", "true");
        muteBtn.setAttribute("aria-label", "Unmute");
      }
      try {
        await video.play();
        setPlaying(true);
      } catch (err) {
        setPlaying(false);
      }
    };

    playBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      playMuted();
    });
    video.addEventListener("click", () => {
      if (video.paused) playMuted();
      else {
        video.pause();
        setPlaying(false);
      }
    });
    if (muteBtn) {
      muteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        video.muted = !video.muted;
        muteBtn.setAttribute("aria-pressed", video.muted ? "true" : "false");
        muteBtn.setAttribute("aria-label", video.muted ? "Unmute" : "Mute");
      });
    }
    video.addEventListener("ended", () => setPlaying(false));
  });


  document.querySelectorAll(".culture-card").forEach((card) => {
    const front = card.querySelector(".fact-front");
    const back = card.querySelector(".fact-back");
    const toggle = () => {
      const open = card.classList.toggle("is-flipped");
      card.setAttribute("aria-expanded", open ? "true" : "false");
      if (front) front.setAttribute("aria-hidden", open ? "true" : "false");
      if (back) back.setAttribute("aria-hidden", open ? "false" : "true");
    };
    card.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      toggle();
    });
    card.addEventListener("keydown", (e) => {
      if (e.target.closest("a")) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  });

})();
