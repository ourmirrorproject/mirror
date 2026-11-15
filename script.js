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

  const remapHash = {
    "watch-reflections": "reflections",
    "japan": "travel-japan",
    "dawn-cafe": "travel-japan"
  };
  const applyLegacyHash = () => {
    const raw = (location.hash || "").replace(/^#/, "");
    const next = remapHash[raw];
    if (next && next !== raw) {
      if (history.replaceState) history.replaceState(null, "", "#" + next);
      else location.hash = next;
    }
  };
  applyLegacyHash();
  window.addEventListener("hashchange", applyLegacyHash);

  function mountPlayer(el) {
    const id = el.getAttribute("data-youtube");
    const title = el.getAttribute("data-title") || "YouTube video";
    if (!id) return;
    const iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?autoplay=1&rel=0&cc_load_policy=0&iv_load_policy=3";
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

document.querySelectorAll(".bts-player:not(.is-native)").forEach((player) => {
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

(function () {
  const lightbox = document.getElementById("yt-lightbox");
  const frame = lightbox ? lightbox.querySelector(".yt-lightbox-frame") : null;

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    if (frame) frame.innerHTML = "";
    document.body.style.overflow = "";
  }

  function openLightbox(id, title) {
    if (!lightbox || !frame || !id) return;
    const iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?autoplay=1&rel=0&cc_load_policy=0&iv_load_policy=3";
    iframe.title = title || "YouTube video";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    frame.innerHTML = "";
    frame.appendChild(iframe);
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    const closeBtn = lightbox.querySelector(".yt-lightbox-close");
    if (closeBtn) closeBtn.focus();
  }

  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-open-video]");
    if (!el) return;
    e.preventDefault();
    openLightbox(el.getAttribute("data-open-video"), el.getAttribute("data-title"));
  });

  if (lightbox) {
    lightbox.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closeLightbox));
    const closeBtn = lightbox.querySelector(".yt-lightbox-close");
    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !lightbox.hidden) closeLightbox();
    });
  }

  async function loadJSON(url, fallbackId) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      return await res.json();
    } catch (err) {
      const inline = document.getElementById(fallbackId);
      if (inline) {
        try { return JSON.parse(inline.textContent); } catch (e2) { return null; }
      }
      return null;
    }
  }

  function mountThumb(el, id, title, src, alt) {
    if (!el || !id) return;
    el.setAttribute("data-youtube", id);
    el.setAttribute("data-title", title || "");
    const img = el.querySelector("img");
    if (img && src) {
      img.src = src;
      img.alt = alt || title || "";
    }
    const btn = el.querySelector(".yt-play");
    if (btn) btn.setAttribute("aria-label", "Play " + (title || "video"));
  }


  const CHEVRON_LEFT = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M9.2 2.2 4.4 7l4.8 4.8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const CHEVRON_RIGHT = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M4.8 2.2 9.6 7l-4.8 4.8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function updateCarousel(wrap) {
    const track = wrap.querySelector(".carousel-track");
    if (!track) return;
    const prev = wrap.querySelector(".carousel-prev");
    const next = wrap.querySelector(".carousel-next");
    const max = track.scrollWidth - track.clientWidth;
    wrap.classList.toggle("is-static", max <= 4);
    if (prev) prev.disabled = track.scrollLeft <= 4;
    if (next) next.disabled = track.scrollLeft >= max - 4;
  }

  function initCarousels(scope) {
    const root = scope || document;
    root.querySelectorAll(".bts-journey, .travel-photos, .japan-gallery, .video-grid").forEach((track) => {
      if (!track.children.length) return;
      let wrap = track.parentElement;
      if (!wrap || !wrap.classList.contains("media-carousel")) {
        wrap = document.createElement("div");
        wrap.className = "media-carousel";
        track.parentNode.insertBefore(wrap, track);
        wrap.appendChild(track);
      }
      track.classList.add("carousel-track");
      if (!track.hasAttribute("tabindex")) track.setAttribute("tabindex", "0");
      if (!track.getAttribute("aria-label")) {
        if (track.classList.contains("bts-journey")) track.setAttribute("aria-label", "Behind the Scenes photos and clips");
        else if (track.classList.contains("travel-photos")) track.setAttribute("aria-label", "Travel photos");
        else if (track.classList.contains("japan-gallery")) track.setAttribute("aria-label", "Photos from the trip");
        else track.setAttribute("aria-label", "Interview videos");
      }
      if (!wrap.querySelector(".carousel-btn")) {
        const prev = document.createElement("button");
        prev.type = "button";
        prev.className = "carousel-btn carousel-prev";
        prev.setAttribute("aria-label", "Scroll left");
        prev.innerHTML = CHEVRON_LEFT;
        const next = document.createElement("button");
        next.type = "button";
        next.className = "carousel-btn carousel-next";
        next.setAttribute("aria-label", "Scroll right");
        next.innerHTML = CHEVRON_RIGHT;
        wrap.insertBefore(prev, track);
        wrap.appendChild(next);
        const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const go = (dir) => {
          const amount = Math.max(Math.round(track.clientWidth * 0.72), 200);
          track.scrollBy({ left: dir * amount, behavior: reduce ? "auto" : "smooth" });
        };
        prev.addEventListener("click", () => go(-1));
        next.addEventListener("click", () => go(1));
        track.addEventListener("scroll", () => updateCarousel(wrap), { passive: true });
        track.addEventListener("keydown", (e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
        });
        if (typeof ResizeObserver !== "undefined") {
          new ResizeObserver(() => updateCarousel(wrap)).observe(track);
        } else {
          window.addEventListener("resize", () => updateCarousel(wrap));
        }
      }
      updateCarousel(wrap);
    });
  }

  if (document.getElementById("votw-player") || document.getElementById("votw-data")) {
  loadJSON("video-of-the-week.json?v=20261115b", "votw-data").then((data) => {
    if (!data || !data.id) return;
    const player = document.getElementById("votw-player");
    const caption = document.getElementById("votw-caption");
    const heading = document.getElementById("votw-title");
    mountThumb(player, data.id, data.title, data.thumbnail, data.title);
    if (caption && data.caption) caption.textContent = data.caption;
    if (heading && data.title) heading.textContent = data.title;
  });
  }

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function bindCultureCards(root) {
    root.querySelectorAll(".culture-card").forEach((card) => {
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
  }

  function renderPlace(place, isHighlight) {
    const root = document.getElementById("travel-highlight");
    if (!root || !place) return;
    const photosList = place.photos || [];
    const kicker = isHighlight ? "This week\u2019s highlight" : "From the travel blog";
    const badge = place.badge ? '<span class="badge-travel">' + escapeHtml(place.badge) + "</span>" : "";
    const cards = (place.cards || []).map((card) => {
      return '<div class="fact-card culture-card" tabindex="0" role="button" aria-expanded="false">' +
        '<div class="fact-flip"><div class="fact-front" aria-hidden="false">' +
        '<span class="fact-kicker">' + escapeHtml(card.kicker) + "</span>" +
        '<span class="fact-country">' + escapeHtml(card.title) + "</span>" +
        '<span class="fact-hint">Tap to flip</span></div>' +
        '<div class="fact-back" aria-hidden="true">' +
        '<span class="fact-kicker">' + escapeHtml(card.kicker) + "</span>" +
        "<p>" + escapeHtml(card.body) + "</p>" +
        '<a class="culture-source" href="' + escapeHtml(card.source_url) +
        '" target="_blank" rel="noopener noreferrer">Source: ' + escapeHtml(card.source_label) +
        "</a></div></div></div>";
    }).join("");
    const photos = photosList.map((ph) => {
      return "<figure><img src=\"" + escapeHtml(ph.src) + "\" width=\"" + (ph.width || "") +
        "\" height=\"" + (ph.height || "") + "\" alt=\"" + escapeHtml(ph.alt || "") +
        "\" loading=\"lazy\"><figcaption>" + (ph.caption_html || "") + "</figcaption></figure>";
    }).join("");
    let videoHtml = "";
    if (place.video && place.video.src) {
      const v = place.video;
      videoHtml =
        '<div class="travel-video">' +
        '<div class="dawn-video">' +
        '<video playsinline controls preload="metadata" poster="' + escapeHtml(v.poster || "") +
        '" width="' + (v.width || "") + '" height="' + (v.height || "") +
        '"><source src="' + escapeHtml(v.src) + '" type="video/mp4"></video></div>' +
        '<div class="dawn-copy">' +
        (v.eyebrow ? '<p class="eyebrow">' + escapeHtml(v.eyebrow) + "</p>" : "") +
        (v.title ? "<h3>" + escapeHtml(v.title) + "</h3>" : "") +
        (v.caption ? "<p>" + escapeHtml(v.caption) + "</p>" : "") +
        "</div></div>";
    }
    const sources = (place.cards || []).map((card) => {
      return "<li><a href=\"" + escapeHtml(card.source_url) +
        "\" target=\"_blank\" rel=\"noopener noreferrer\">" + escapeHtml(card.source_label) +
        "</a> \u2014 " + escapeHtml(card.title) + "</li>";
    }).join("");

    root.innerHTML =
      '<div class="travel-highlight-head"><div>' +
      '<p class="travel-kicker">' + kicker + "</p>" +
      "<h3>" + escapeHtml(place.name) + "</h3></div>" + badge + "</div>" +
      '<p class="travel-note">' + escapeHtml(place.note) + "</p>" +
      (photos ? '<div class="travel-photos">' + photos + "</div>" : "") +
      videoHtml +
      '<h4 class="culture-heading">Culture cards</h4>' +
      '<p class="culture-lede">Tap or click a card to flip it.</p>' +
      '<div class="culture-grid">' + cards + "</div>" +
      '<details class="travel-sources"><summary>Sources</summary><ul>' + sources + "</ul></details>";

    bindCultureCards(root);
    initCarousels(root);
  }

  function renderChips(places, activeId, onPick) {
    const nav = document.getElementById("travel-chips");
    if (!nav) return;
    nav.innerHTML = "";
    places.forEach((place) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "place-chip" + (place.id === activeId ? " is-active" : "");
      btn.textContent = place.name;
      btn.setAttribute("aria-pressed", place.id === activeId ? "true" : "false");
      btn.addEventListener("click", () => onPick(place.id));
      nav.appendChild(btn);
    });
  }

  function placeFromHash() {
    const h = (location.hash || "").replace(/^#/, "").toLowerCase();
    if (h === "japan" || h === "travel-japan" || h === "dawn-cafe") return "japan";
    return null;
  }

  if (document.getElementById("travel-highlight") || document.getElementById("travel-blog-data")) {
  loadJSON("travel-blog.json?v=20261115b", "travel-blog-data").then((data) => {
    if (!data || !data.places || !data.places.length) return;
    const highlightId = data.highlight || data.places[0].id;
    const show = (id) => {
      const place = data.places.find((p) => p.id === id) || data.places[0];
      renderPlace(place, place.id === highlightId);
      renderChips(data.places, place.id, show);
    };
    show(placeFromHash() || highlightId);
    window.addEventListener("hashchange", () => {
      const id = placeFromHash();
      if (!id) return;
      show(id);
    });
  });
  }

  function renderRegionVideos() {
    const root = document.getElementById("region-videos");
    if (!root) return;
    const slug = root.getAttribute("data-region");
    const jsonUrl = "../data/regions.json?v=20261115b";
    loadJSON(jsonUrl, "region-videos-data").then((data) => {
      const region = data && data.regions && data.regions[slug];
      const videos = (region && region.videos) || [];
      const lede = document.querySelector(".region-videos-lede");
      const empty = document.querySelector(".region-videos-empty");
      if (!videos.length) {
        if (lede) lede.hidden = true;
        if (empty) empty.hidden = false;
        return;
      }
      if (lede) lede.hidden = false;
      if (empty) empty.hidden = true;
      const grid = document.createElement("div");
      grid.className = "video-grid";
      videos.forEach((v) => {
        if (!v || !v.id) return;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "video-thumb";
        btn.setAttribute("data-open-video", v.id);
        btn.setAttribute("data-title", v.title || "Interview");
        const img = document.createElement("img");
        img.src = "https://i.ytimg.com/vi/" + encodeURIComponent(v.id) + "/hqdefault.jpg";
        img.width = 480;
        img.height = 360;
        img.alt = "";
        img.loading = "lazy";
        const span = document.createElement("span");
        span.textContent = v.title || "Interview";
        btn.appendChild(img);
        btn.appendChild(span);
        grid.appendChild(btn);
      });
      root.appendChild(grid);
      if (region.playlist) {
        const a = document.createElement("a");
        a.className = "playlist-link";
        a.href = "https://www.youtube.com/playlist?list=" + encodeURIComponent(region.playlist);
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = "Watch the playlist";
        root.appendChild(a);
      }
      initCarousels(root);
    });
  }

  renderRegionVideos();
  initCarousels();
})();
