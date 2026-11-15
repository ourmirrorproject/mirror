
function youtubeEmbedSrc(id, opts) {
  opts = opts || {};
  const params = new URLSearchParams();
  if (opts.autoplay) params.set("autoplay", "1");
  params.set("rel", "0");
  params.set("cc_load_policy", "0");
  params.set("iv_load_policy", "3");
  params.set("hl", "en");
  params.set("cc_lang_pref", "en");
  if (opts.start !== undefined && opts.start !== null && String(opts.start) !== "") {
    const start = parseInt(opts.start, 10);
    if (!Number.isNaN(start) && start >= 0) params.set("start", String(start));
  }
  if (opts.end !== undefined && opts.end !== null && String(opts.end) !== "") {
    const end = parseInt(opts.end, 10);
    if (!Number.isNaN(end) && end > 0) params.set("end", String(end));
  }
  return "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?" + params.toString();
}

function readTimeAttr(el, name) {
  if (!el) return null;
  const raw = el.getAttribute(name);
  if (raw === null || raw === "") return null;
  const n = parseInt(raw, 10);
  return Number.isNaN(n) ? null : n;
}

const YT_IFRAME_ALLOW = "autoplay; encrypted-media; picture-in-picture; fullscreen";

function mountYouTubeIframe(id, title, start, end) {
  const iframe = document.createElement("iframe");
  iframe.src = youtubeEmbedSrc(id, { autoplay: true, start: start, end: end });
  iframe.title = title || "YouTube video";
  iframe.allow = YT_IFRAME_ALLOW;
  iframe.setAttribute("allowfullscreen", "");
  iframe.allowFullscreen = true;
  iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
  return iframe;
}

function mountPlayer(el) {
  if (!el || el.classList.contains("is-playing")) return;
  const id = el.getAttribute("data-youtube");
  const title = el.getAttribute("data-title") || "YouTube video";
  if (!id) return;
  const iframe = mountYouTubeIframe(id, title, readTimeAttr(el, "data-start"), readTimeAttr(el, "data-end"));
  el.classList.add("is-playing");
  const btn = el.querySelector(".yt-play");
  const img = el.querySelector("img");
  if (btn) btn.remove();
  if (img) img.remove();
  el.appendChild(iframe);
}

document.addEventListener("click", (e) => {
  const el = e.target.closest(".yt");
  if (!el || el.classList.contains("is-playing")) return;
  if (e.target.closest("a")) return;
  e.preventDefault();
  mountPlayer(el);
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const el = e.target.closest && e.target.closest(".yt");
  if (!el || el.classList.contains("is-playing")) return;
  e.preventDefault();
  mountPlayer(el);
});

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
    if (btn.closest(".region-didyouknow")) return;
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

  function openLightbox(id, title, start, end) {
    if (!lightbox || !frame || !id) return;
    const iframe = mountYouTubeIframe(id, title || "YouTube video", start, end);
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
    openLightbox(
      el.getAttribute("data-open-video"),
      el.getAttribute("data-title"),
      readTimeAttr(el, "data-start"),
      readTimeAttr(el, "data-end")
    );
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

  function mountThumb(el, id, title, src, alt, times) {
    if (!el || !id) return;
    el.setAttribute("data-youtube", id);
    el.setAttribute("data-title", title || "");
    times = times || {};
    if (times.start !== undefined && times.start !== null && String(times.start) !== "") {
      el.setAttribute("data-start", String(times.start));
    } else {
      el.removeAttribute("data-start");
    }
    if (times.end !== undefined && times.end !== null && String(times.end) !== "") {
      el.setAttribute("data-end", String(times.end));
    } else {
      el.removeAttribute("data-end");
    }
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
    const looping = wrap.classList.contains("is-looping");
    const max = track.scrollWidth - track.clientWidth;
    const count = track.querySelectorAll(":scope > :not([data-carousel-clone])").length;
    wrap.classList.toggle("is-static", max <= 4 && !looping && count < 2);
    if (prev) prev.disabled = false;
    if (next) next.disabled = false;
  }

  function carouselSetWidth(track) {
    const n = Number(track.dataset.loopCount || 0);
    if (n < 1) return 0;
    const kids = Array.from(track.children);
    if (kids.length < n * 2) return 0;
    const firstOrig = kids[n];
    const firstClone = kids[0];
    return firstOrig.offsetLeft - firstClone.offsetLeft;
  }

  function neutralizeClone(clone) {
    clone.setAttribute("data-carousel-clone", "true");
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("[data-open-video]").forEach((el) => {
      el.removeAttribute("data-open-video");
      el.setAttribute("data-carousel-ghost", "true");
    });
    clone.querySelectorAll("video").forEach((v) => {
      v.pause();
      v.removeAttribute("src");
      v.querySelectorAll("source").forEach((s) => s.remove());
      v.preload = "none";
      v.removeAttribute("controls");
      v.classList.add("is-clone-video");
    });
    clone.querySelectorAll("button, a").forEach((el) => {
      el.setAttribute("tabindex", "-1");
      el.setAttribute("aria-hidden", "true");
    });
  }

  function setupCarouselLoop(wrap, track) {
    if (track.dataset.loopReady === "1") return;
    const originals = Array.from(track.children);
    if (originals.length < 1) return;
    // Only loop when the row actually overflows
    const overflows = track.scrollWidth - track.clientWidth > 8;
    if (!overflows) return;
    track.dataset.loopReady = "1";
    originals.forEach((node, i) => node.setAttribute("data-carousel-index", String(i)));
    const prepend = [];
    originals.forEach((node) => {
      const clone = node.cloneNode(true);
      neutralizeClone(clone);
      prepend.push(clone);
    });
    originals.forEach((node) => {
      const clone = node.cloneNode(true);
      neutralizeClone(clone);
      track.appendChild(clone);
    });
    prepend.reverse().forEach((clone) => track.insertBefore(clone, track.firstChild));
    track.dataset.loopCount = String(originals.length);
    track.dataset.loopReady = "1";
    wrap.classList.add("is-looping");
    const jumpToOriginals = () => {
      const w = carouselSetWidth(track);
      if (w > 0) {
        const prev = track.style.scrollBehavior;
        track.style.scrollBehavior = "auto";
        track.scrollLeft = w;
        track.style.scrollBehavior = prev;
      }
    };
    requestAnimationFrame(() => requestAnimationFrame(jumpToOriginals));
    let ticking = false;
    track.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        if (track.dataset.wrapLock === "1") return;
        const w = carouselSetWidth(track);
        if (w <= 0) return;
        const sl = track.scrollLeft;
        if (sl >= w * 2 - 2) {
          track.style.scrollBehavior = "auto";
          track.scrollLeft = sl - w;
        } else if (sl <= 2) {
          track.style.scrollBehavior = "auto";
          track.scrollLeft = sl + w;
        }
      });
    }, { passive: true });
    // Clicks on clones should activate the matching original, never a second player
    track.addEventListener("click", (e) => {
      const clone = e.target.closest("[data-carousel-clone]");
      if (!clone || !track.contains(clone)) return;
      e.preventDefault();
      e.stopPropagation();
      const idx = clone.getAttribute("data-carousel-index");
      const original = track.querySelector(':scope > [data-carousel-index="' + idx + '"]:not([data-carousel-clone])');
      if (!original) return;
      const playBtn = original.querySelector(".bts-play, [data-open-video], .yt-play, video");
      if (playBtn) playBtn.click();
    }, true);
  }

  function initCarousels(scope) {
    const root = scope || document;
    root.querySelectorAll(".bts-journey, .travel-photos, .japan-gallery, .region-gallery, .video-grid").forEach((track) => {
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
          const behavior = reduce ? "auto" : "smooth";
          const looping = wrap.classList.contains("is-looping");
          const n = Number(track.dataset.loopCount || 0);
          const items = Array.from(track.children);
          if (!items.length) return;
          const sl = track.scrollLeft;
          if (looping && n > 0 && items.length >= n * 2) {
            let best = n, bestDist = Infinity;
            items.forEach((el, i) => {
              const d = Math.abs(el.offsetLeft - sl);
              if (d < bestDist) { bestDist = d; best = i; }
            });
            const target = items[best + dir];
            if (target) {
              track.dataset.wrapLock = "1";
              track.scrollTo({ left: target.offsetLeft, behavior });
              const unlock = () => {
                if (track.dataset.wrapLock !== "1") return;
                track.dataset.wrapLock = "";
                const w = carouselSetWidth(track);
                if (w <= 0) return;
                const x = track.scrollLeft;
                const prevBe = track.style.scrollBehavior;
                track.style.scrollBehavior = "auto";
                if (x >= w * 2 - 2) track.scrollLeft = x - w;
                else if (x <= 2) track.scrollLeft = x + w;
                track.style.scrollBehavior = prevBe;
              };
              track.addEventListener("scrollend", unlock, { once: true });
              setTimeout(unlock, 700);
              return;
            }
          }
          const max = Math.max(0, track.scrollWidth - track.clientWidth);
          if (dir > 0 && sl >= max - 8) {
            track.scrollTo({ left: 0, behavior });
            return;
          }
          if (dir < 0 && sl <= 8) {
            track.scrollTo({ left: max, behavior });
            return;
          }
          const amount = Math.max(Math.round(track.clientWidth * 0.72), 200);
          track.scrollBy({ left: dir * amount, behavior });
        };
        prev.addEventListener("click", () => go(-1));
        next.addEventListener("click", () => go(1));
        track.addEventListener("scroll", () => updateCarousel(wrap), { passive: true });
        track.addEventListener("keydown", (e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
        });
        const retryLoop = () => { setupCarouselLoop(wrap, track); updateCarousel(wrap); };
        if (typeof ResizeObserver !== "undefined") {
          new ResizeObserver(retryLoop).observe(track);
        } else {
          window.addEventListener("resize", retryLoop);
        }
        track.querySelectorAll("img").forEach((img) => {
          if (!img.complete) img.addEventListener("load", retryLoop, { once: true });
        });
      }
      setupCarouselLoop(wrap, track);
      updateCarousel(wrap);
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


  function resolveMonthlyHighlight(data) {
    const month = new Date().getMonth();
    const byMonth = data.featuredByMonth;
    if (Array.isArray(byMonth) && byMonth.length) {
      const id = byMonth[month % byMonth.length];
      if (id && data.places.some((p) => p.id === id)) return id;
    }
    return data.highlight || data.places[0].id;
  }

  function orderPlacesForChips(places, highlightId) {
    const list = places.slice();
    const i = list.findIndex((p) => p.id === highlightId);
    if (i > 0) {
      const feat = list.splice(i, 1)[0];
      list.unshift(feat);
    }
    return list;
  }

  function liveViewBar(webcam, timezone, placeName) {
    const bits = [];
    if (webcam && webcam.youtube) {
      const label = webcam.label || "Live view";
      bits.push(
        '<button type="button" class="live-pill" data-open-video="' + escapeHtml(webcam.youtube) +
        '" data-title="' + escapeHtml(label) +
        '" aria-label="Live view: ' + escapeHtml(label) + '">' +
        '<span class="live-dot" aria-hidden="true"></span>Live view' +
        (webcam.label ? '<span class="live-pill-place">' + escapeHtml(webcam.label) + "</span>" : "") +
        "</button>"
      );
    }
    if (timezone) {
      bits.push(
        '<span class="local-time" data-timezone="' + escapeHtml(timezone) + '">' +
        '<span class="local-time-label">Local time</span> <time></time></span>'
      );
    }
    if (!bits.length) return "";
    return '<div class="live-view">' + bits.join("") + "</div>";
  }

  function formatClock(timezone) {
    const now = new Date();
    const time = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: false
    }).format(now);
    let zone = "";
    try {
      const part = new Intl.DateTimeFormat("en-GB", { timeZone: timezone, timeZoneName: "short" })
        .formatToParts(now)
        .find((p) => p.type === "timeZoneName");
      zone = part ? part.value : "";
    } catch (e) {}
    return { time: time, zone: zone };
  }

  function tickLocalClocks(root) {
    (root || document).querySelectorAll(".local-time[data-timezone]").forEach((el) => {
      const tz = el.getAttribute("data-timezone");
      const timeEl = el.querySelector("time");
      if (!tz || !timeEl) return;
      try {
        const clock = formatClock(tz);
        timeEl.dateTime = new Date().toISOString();
        timeEl.textContent = clock.time + (clock.zone ? " " + clock.zone : "");
      } catch (e) {}
    });
  }

  function initLocalClocks(root) {
    tickLocalClocks(root || document);
    if (!window.__mirrorClockTimer) {
      window.__mirrorClockTimer = setInterval(() => tickLocalClocks(document), 30000);
    }
  }

  function renderPlace(place, isHighlight) {
    const root = document.getElementById("travel-highlight");
    if (!root || !place) return;
    const photosList = place.photos || [];
    const kicker = isHighlight ? "" : "From the travel blog";
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
    const liveBar = liveViewBar(place.webcam, place.timezone, place.name);
    root.innerHTML =
      '<div class="travel-highlight-head"><div>' +
      (kicker ? '<p class="travel-kicker">' + kicker + "</p>" : "") +
      "<h3>" + escapeHtml(place.name) + "</h3>" + liveBar + "</div>" + badge + "</div>" +
      '<div class="travel-stage">' +
      '<div class="travel-stage-main">' +
      '<p class="travel-note">' + escapeHtml(place.note) + "</p>" +
      (photos ? '<div class="travel-photos">' + photos + "</div>" : "") +
      videoHtml +
      "</div>" +
      '<aside class="travel-stage-aside">' +
      '<h4 class="culture-heading">Culture cards</h4>' +
      '<p class="culture-lede">Tap or click a card to flip it.</p>' +
      '<div class="culture-grid culture-collage">' + cards + "</div>" +
      "</aside></div>";

    bindCultureCards(root);
    initCarousels(root);
    initLocalClocks(root);
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
  loadJSON("travel-blog.json?v=20261115t", "travel-blog-data").then((data) => {
    if (!data || !data.places || !data.places.length) return;
    const highlightId = resolveMonthlyHighlight(data);
    const ordered = orderPlacesForChips(data.places, highlightId);
    const show = (id) => {
      const place = data.places.find((p) => p.id === id) || data.places[0];
      renderPlace(place, place.id === highlightId);
      renderChips(ordered, place.id, show);
    };
    show(placeFromHash() || highlightId);
    window.addEventListener("hashchange", () => {
      const id = placeFromHash();
      if (!id) return;
      show(id);
    });
  });
  }

  function mediaUrl(src) {
    if (!src) return src;
    if (/^https?:/i.test(src) || src.startsWith("../") || src.startsWith("/")) return src;
    const onRegion = !!document.getElementById("region-videos");
    return (onRegion ? "../" : "") + src;
  }

  function interviewThumb(v) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "video-thumb";
    btn.setAttribute("data-open-video", v.id);
    btn.setAttribute("data-title", v.title || "Interview");
    if (v.start !== undefined && v.start !== null && String(v.start) !== "") {
      btn.setAttribute("data-start", String(v.start));
    }
    if (v.end !== undefined && v.end !== null && String(v.end) !== "") {
      btn.setAttribute("data-end", String(v.end));
    }
    const img = document.createElement("img");
    img.src = v.thumbnail
      ? mediaUrl(v.thumbnail)
      : ("https://i.ytimg.com/vi/" + encodeURIComponent(v.id) + "/hqdefault.jpg");
    img.width = 480;
    img.height = 360;
    img.alt = "";
    img.loading = "lazy";
    const span = document.createElement("span");
    span.textContent = v.title || "Interview";
    btn.appendChild(img);
    btn.appendChild(span);
    return btn;
  }

  function peopleFromRegion(region) {
    if (!region) return [];
    if (Array.isArray(region.people) && region.people.length) {
      return region.people.map((person) => ({
        thumbnail: person && person.thumbnail,
        clips: (person && person.clips) || []
      }));
    }
    return ((region.videos) || []).map((v) => ({ clips: [v] }));
  }

  function renderRegionVideos() {
    const root = document.getElementById("region-videos");
    if (!root) return;
    const slug = root.getAttribute("data-region");
    const jsonUrl = "../data/regions.json?v=20261115t";
    function mountRegionLiveBar(data) {
      const holder = document.querySelector(".region-section > .wrap > .section-head");
      const group = document.getElementById("region-videos");
      if (!holder || !data || !data.regions) return;
      const key = ((group && group.getAttribute("data-region")) || "").toLowerCase();
      const region = data.regions[key];
      if (!region) return;
      holder.querySelectorAll(".live-view").forEach((el) => el.remove());
      const bar = liveViewBar(region.webcam, region.timezone, region.name);
      if (bar) {
        holder.insertAdjacentHTML("beforeend", bar);
        initLocalClocks(holder);
      }
    }
    function mountRegionFacts(region) {
      const card = document.querySelector(".region-didyouknow .fact-card");
      if (!card || !region) return;
      const facts = (region.facts || []).filter((f) => f && f.text);
      if (!facts.length) return;
      const flip = card.querySelector(".fact-flip");
      const back = card.querySelector(".fact-back");
      const front = card.querySelector(".fact-front");
      if (!flip || !back) return;
      const sources = card.closest(".region-didyouknow").querySelector("details.fact-sources");
      if (sources) sources.hidden = true;
      const lede = card.closest(".region-didyouknow").querySelector(".clips-lede");
      if (lede) lede.textContent = "Tap or click the card to flip it. Flip again to return to the front, then flip for the next fact.";
      const hint = card.querySelector(".fact-hint");
      if (hint) hint.textContent = "Tap to flip";
      let index = 0;
      function showFact() {
        const fact = facts[index];
        back.replaceChildren();
        const head = document.createElement("div");
        head.className = "fact-back-head";
        const country = document.createElement("span");
        country.className = "fact-country";
        country.textContent = region.name || "";
        const counter = document.createElement("span");
        counter.className = "fact-index";
        counter.textContent = (index + 1) + "/" + facts.length;
        head.appendChild(country);
        head.appendChild(counter);
        const text = document.createElement("p");
        text.className = "fact-text";
        text.textContent = fact.text;
        const srcLine = document.createElement("p");
        srcLine.className = "fact-source-line";
        if (fact.source_url && fact.source_label) {
          srcLine.appendChild(document.createTextNode("Source: "));
          const a = document.createElement("a");
          a.href = fact.source_url;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          a.textContent = fact.source_label;
          srcLine.appendChild(a);
        } else if (fact.source_label) {
          srcLine.textContent = "Source: " + fact.source_label;
        }
        back.appendChild(head);
        back.appendChild(text);
        if (srcLine.childNodes.length) back.appendChild(srcLine);
      }
      showFact();
      const advance = (event) => {
        if (event.target.closest("a")) return;
        if (event.type === "keydown" && event.key !== "Enter" && event.key !== " ") return;
        if (event.type === "keydown") event.preventDefault();
        if (!card.classList.contains("is-flipped")) {
          showFact();
          card.classList.add("is-flipped");
          flip.setAttribute("aria-expanded", "true");
          back.setAttribute("aria-hidden", "false");
          if (front) front.setAttribute("aria-hidden", "true");
          return;
        }
        card.classList.remove("is-flipped");
        flip.setAttribute("aria-expanded", "false");
        back.setAttribute("aria-hidden", "true");
        if (front) front.setAttribute("aria-hidden", "false");
        index = (index + 1) % facts.length;
      };
      flip.addEventListener("click", advance);
      flip.addEventListener("keydown", advance);
    }
    loadJSON(jsonUrl, "region-videos-data").then((data) => {
      mountRegionLiveBar(data);
      const region = data && data.regions && data.regions[slug];
      mountRegionFacts(region);
      const people = peopleFromRegion(region).map((person) => ({
        thumbnail: person.thumbnail,
        clips: (person.clips || []).filter((v) => v && (v.id || v.src))
      })).filter((person) => person.clips.length);
      const lede = document.querySelector(".region-videos-lede");
      const empty = document.querySelector(".region-videos-empty");
      if (!people.length) {
        if (lede) lede.hidden = true;
        if (empty) empty.hidden = false;
        return;
      }
      if (lede) lede.hidden = false;
      if (empty) empty.hidden = true;
      function localInterviewPlayer(v) {
        const fig = document.createElement("figure");
        fig.className = "local-interview";
        const frame = document.createElement("div");
        frame.className = "local-interview-frame";
        const video = document.createElement("video");
        video.setAttribute("playsinline", "");
        video.setAttribute("controls", "");
        video.preload = "metadata";
        video.width = 720;
        video.height = 1280;
        if (v.poster) video.poster = mediaUrl(v.poster);
        const source = document.createElement("source");
        source.src = mediaUrl(v.src);
        source.type = v.type || "video/mp4";
        video.appendChild(source);
        frame.appendChild(video);
        fig.appendChild(frame);
        return fig;
      }
      const localList = document.createElement("div");
      localList.className = "region-local-clips";
      const clipGrid = document.createElement("div");
      clipGrid.className = "region-clip-grid";
      people.forEach((person) => {
        const localClips = person.clips.filter((v) => v.src && !v.id);
        const ytClips = person.clips.filter((v) => v.id);
        localClips.forEach((clip) => localList.appendChild(localInterviewPlayer(clip)));
        ytClips.forEach((clip) => clipGrid.appendChild(interviewThumb(clip)));
      });
      if (localList.childElementCount) root.appendChild(localList);
      if (clipGrid.childElementCount) root.appendChild(clipGrid);
      if (region && region.playlist) {
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
