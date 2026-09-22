(function () {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");

  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  const DEV_TOOLS_KEY = "portfolioDevToolsV1";
  const SCENE_QUALITY_FORCE_KEY = "portfolioSceneQualityForceV1";

  const VIEWPORT_PRESETS = [
    { id: "phone", label: "Phone", width: 390 },
    { id: "phablet", label: "700", width: 700 },
    { id: "nav", label: "820", width: 820 },
    { id: "tablet", label: "960", width: 960 },
    { id: "desktop", label: "1280", width: 1280 }
  ];

  function isLocalHost() {
    const host = location.hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  }

  function envAllowsDevTools() {
    try {
      const env = window.__PORTFOLIO_ENV__;
      if (env && Object.prototype.hasOwnProperty.call(env, "DEV_TOOLS")) {
        return env.DEV_TOOLS === true;
      }
    } catch (err) {
      console.warn("Could not read __PORTFOLIO_ENV__", err);
    }
    return true;
  }

  function isDevToolsEnabled() {
    try {
      if (!envAllowsDevTools()) return false;
      const params = new URLSearchParams(location.search);
      if (params.get("embed") === "1" || params.get("dev") === "0") return false;
      if (params.get("dev") === "1") {
        try {
          localStorage.setItem(DEV_TOOLS_KEY, "1");
        } catch (err) {
          console.warn("Could not persist dev tools flag", err);
        }
        return true;
      }
      if (localStorage.getItem(DEV_TOOLS_KEY) === "1") return true;
      return isLocalHost();
    } catch (err) {
      console.warn("Could not resolve dev tools gate", err);
      return false;
    }
  }

  function disableDevToolsPersistently() {
    try {
      localStorage.removeItem(DEV_TOOLS_KEY);
    } catch (err) {
      console.warn("Could not clear dev tools flag", err);
    }
  }

  function embedPreviewUrl() {
    try {
      const url = new URL(location.href);
      url.searchParams.set("embed", "1");
      url.searchParams.delete("dev");
      // Bust bfcache / stale iframe assets while iterating locally
      url.searchParams.set("pv", String(Date.now()));
      return url.toString();
    } catch (err) {
      console.warn("Could not build embed preview URL", err);
      return `${location.pathname}?embed=1&pv=${Date.now()}`;
    }
  }

  function ensureDevTools() {
    if (!isDevToolsEnabled()) return null;

    let root = document.getElementById("dev-tools");
    if (root) return root;

    root = document.createElement("aside");
    root.id = "dev-tools";
    root.className = "dev-tools";
    root.setAttribute("data-collapsed", "false");
    root.innerHTML = `
      <div class="dev-tools-bar">
        <strong class="dev-tools-title">Dev tools</strong>
        <span class="dev-tools-viewport-live" id="dev-tools-viewport-live" aria-live="polite"></span>
        <button type="button" class="dev-tools-toggle" id="dev-tools-toggle" aria-expanded="true">Hide</button>
      </div>
      <div class="dev-tools-body" id="dev-tools-body">
        <section class="dev-tools-section" aria-label="Viewport preview">
          <h2 class="dev-tools-heading">Viewport</h2>
          <p class="dev-tools-note">Presets open an iframe so <code>@media</code> rules actually fire. Close to return.</p>
          <div class="dev-tools-presets" id="dev-tools-presets"></div>
          <p class="dev-tools-hint">Allowed when <code>PORTFOLIO_DEV_TOOLS</code> is true (local). Then on by localhost, <code>?dev=1</code>, or saved flag. Publish sets the env flag false so tools never appear on GitHub Pages. <button type="button" class="dev-tools-link" id="dev-tools-disable">Turn off &amp; forget</button></p>
        </section>
        <div id="dev-tools-extra"></div>
      </div>
    `;
    document.body.appendChild(root);

    const body = root.querySelector("#dev-tools-body");
    const toggle = root.querySelector("#dev-tools-toggle");
    const live = root.querySelector("#dev-tools-viewport-live");
    const presetsEl = root.querySelector("#dev-tools-presets");
    const disableBtn = root.querySelector("#dev-tools-disable");

    function refreshLiveSize() {
      if (!live) return;
      live.textContent = `${window.innerWidth}×${window.innerHeight}`;
    }

    refreshLiveSize();
    window.addEventListener("resize", refreshLiveSize, { passive: true });

    toggle.addEventListener("click", () => {
      const collapsed = root.getAttribute("data-collapsed") === "true";
      root.setAttribute("data-collapsed", collapsed ? "false" : "true");
      toggle.setAttribute("aria-expanded", collapsed ? "true" : "false");
      toggle.textContent = collapsed ? "Hide" : "Show";
    });

    disableBtn.addEventListener("click", () => {
      disableDevToolsPersistently();
      closeViewportPreview();
      root.remove();
    });

    function closeViewportPreview() {
      const stage = document.getElementById("dev-viewport-stage");
      if (stage) stage.remove();
      document.documentElement.classList.remove("has-dev-viewport");
      presetsEl.querySelectorAll("[data-width]").forEach((btn) => {
        btn.classList.remove("is-active");
      });
    }

    function openViewportPreview(width, label, button) {
      closeViewportPreview();
      document.documentElement.classList.add("has-dev-viewport");
      button.classList.add("is-active");

      const stage = document.createElement("div");
      stage.id = "dev-viewport-stage";
      stage.className = "dev-viewport-stage";
      stage.innerHTML = `
        <div class="dev-viewport-chrome">
          <span class="dev-viewport-chrome-label">${label} · ${width}px</span>
          <button type="button" class="dev-viewport-close" aria-label="Close viewport preview">Close</button>
        </div>
        <div class="dev-viewport-frame-wrap" style="width:${width}px">
          <iframe class="dev-viewport-frame" title="Viewport preview at ${width}px" src="${embedPreviewUrl()}"></iframe>
        </div>
      `;
      document.body.appendChild(stage);
      stage.querySelector(".dev-viewport-close").addEventListener("click", closeViewportPreview);
    }

    VIEWPORT_PRESETS.forEach((preset) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "dev-tools-preset";
      btn.dataset.width = String(preset.width);
      btn.textContent = preset.label;
      btn.title = `${preset.width}px wide`;
      btn.addEventListener("click", () => openViewportPreview(preset.width, preset.label, btn));
      presetsEl.appendChild(btn);
    });

    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "dev-tools-preset dev-tools-preset-clear";
    clearBtn.textContent = "Exit";
    clearBtn.addEventListener("click", closeViewportPreview);
    presetsEl.appendChild(clearBtn);

    window.__portfolioCloseDevViewport = closeViewportPreview;
    return root;
  }

  function getSceneQualityForce() {
    try {
      const v = localStorage.getItem(SCENE_QUALITY_FORCE_KEY) || "auto";
      return v === "full" || v === "lite" ? v : "auto";
    } catch (err) {
      console.warn("Could not read scene quality force", err);
      return "auto";
    }
  }

  function setSceneQualityForce(mode) {
    const next = mode === "full" || mode === "lite" ? mode : "auto";
    try {
      if (next === "auto") localStorage.removeItem(SCENE_QUALITY_FORCE_KEY);
      else localStorage.setItem(SCENE_QUALITY_FORCE_KEY, next);
    } catch (err) {
      console.warn("Could not persist scene quality force", err);
    }
    return next;
  }

  function sceneQuality() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const force = getSceneQualityForce();
    const reasons = [];
    let autoLite = false;

    if (reduced) {
      autoLite = true;
      reasons.push("prefers-reduced-motion");
    }

    try {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (conn) {
        if (conn.saveData) {
          autoLite = true;
          reasons.push("save-data");
        }
        if (conn.effectiveType === "slow-2g" || conn.effectiveType === "2g") {
          autoLite = true;
          reasons.push(`network:${conn.effectiveType}`);
        }
      }
    } catch (err) {
      console.warn("Could not read network hints for scene quality", err);
    }

    try {
      if (typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 2) {
        autoLite = true;
        reasons.push(`deviceMemory:${navigator.deviceMemory}`);
      }
    } catch (err) {
      console.warn("Could not read device memory for scene quality", err);
    }

    let lite = autoLite;
    if (force === "full") lite = false;
    if (force === "lite") lite = true;

    if (!reasons.length) reasons.push("none");

    return {
      reduced,
      lite,
      force,
      autoLite,
      reasons,
      parallax: !(lite || (reduced && force !== "full"))
    };
  }

  function injectScene(el, html, quality, onReady) {
    if (!el) return;
    const q = quality || sceneQuality();
    requestAnimationFrame(() => {
      el.innerHTML = html;
      if (q.reduced || q.lite) {
        el.querySelectorAll("animateMotion").forEach((node) => node.remove());
      }
      if (typeof onReady === "function") onReady(el);
    });
  }

  function plxGroup(depth, content, enabled) {
    if (!content) return "";
    if (!enabled) return content;
    return `<g class="plx-layer" style="--plx-depth:${depth}">${content}</g>`;
  }

  function wrapCelestial(phase, quality, markup) {
    if (!markup) return "";
    if (!(quality && quality.parallax)) return markup;
    // Rise: up + left. Set: down + left. Night moon: gentle left + slight up.
    const setting = phase === "golden" || phase === "sunset" || phase === "dusk";
    const yFactor = setting ? 0.42 : -0.5;
    return `<g class="plx-layer plx-celestial" style="--plx-depth:0.4;--plx-x:-0.75;--plx-y-factor:${yFactor}">${markup}</g>`;
  }

  function buildTerrainLayers(phase, quality) {
    const q = quality || sceneQuality();
    // Lite / no-parallax: original Skyclock only (no terrain)
    if (!q.parallax) return "";

    const dark =
      phase === "sunset" || phase === "dusk" || phase === "night" || phase === "late";

    const colors = dark
      ? {
          // Lighter far band so near-black trees read as a silhouette
          far:
            phase === "sunset"
              ? "#5a3040"
              : phase === "dusk"
                ? "#3a2a55"
                : phase === "night"
                  ? "#1a2840"
                  : "#141c30",
          mid:
            phase === "sunset"
              ? "#2e1520"
              : phase === "dusk"
                ? "#1a142c"
                : phase === "night"
                  ? "#0a121c"
                  : "#070b14",
          fore: phase === "sunset" ? "#080406" : "#000208",
          rim:
            phase === "sunset"
              ? "rgba(240,178,122,0.35)"
              : phase === "dusk"
                ? "rgba(180,160,220,0.28)"
                : "rgba(122,215,255,0.22)"
        }
      : {
          far:
            phase === "dawn"
              ? "#8a7088"
              : phase === "golden"
                ? "#9a7850"
                : phase === "morning"
                  ? "#6a8a9a"
                  : "#5a7a8a",
          mid:
            phase === "dawn"
              ? "#5a4868"
              : phase === "golden"
                ? "#6a5030"
                : phase === "morning"
                  ? "#3a5a68"
                  : "#2a4a58",
          fore:
            phase === "dawn"
              ? "#2a2038"
              : phase === "golden"
                ? "#2a1c10"
                : "#122028",
          rim: "rgba(255,255,255,0.12)"
        };

    const farHills = `<path d="M400 900 C580 860 720 875 880 855 C1040 835 1180 860 1320 845 C1380 838 1420 850 1440 845 L1440 980 L400 980 Z" opacity="${dark ? 0.85 : 0.55}"/>
      <path d="M620 920 C800 885 940 900 1100 885 C1240 870 1340 895 1440 880 L1440 980 L620 980 Z" opacity="${dark ? 0.95 : 0.75}"/>`;

    const midHills = `<path d="M280 940 C480 905 640 920 820 900 C1000 880 1160 910 1320 895 C1380 888 1420 900 1440 895 L1440 980 L280 980 Z"/>
      <path d="M480 955 C680 925 840 940 1020 925 C1180 910 1320 940 1440 925 L1440 980 L480 980 Z" opacity="0.92"/>`;

    function pine(x, baseY, h) {
      const w = h * 0.42;
      return `<path d="M${x} ${baseY - h}
        L${x + w * 0.18} ${baseY - h * 0.62}
        L${x + w * 0.08} ${baseY - h * 0.62}
        L${x + w * 0.38} ${baseY - h * 0.38}
        L${x + w * 0.12} ${baseY - h * 0.38}
        L${x + w * 0.5} ${baseY - h * 0.16}
        L${x - w * 0.5} ${baseY - h * 0.16}
        L${x - w * 0.12} ${baseY - h * 0.38}
        L${x - w * 0.38} ${baseY - h * 0.38}
        L${x - w * 0.08} ${baseY - h * 0.62}
        L${x - w * 0.18} ${baseY - h * 0.62} Z"/>`;
    }

    // Taller trees on dark phases so the treeline is readable at rest
    const treeBand = dark
      ? `${pine(960, 978, 130)}${pine(1050, 978, 170)}${pine(1140, 978, 210)}
        ${pine(1235, 978, 165)}${pine(1325, 978, 220)}${pine(1410, 978, 150)}`
      : `${pine(1000, 978, 95)}${pine(1085, 978, 125)}${pine(1170, 978, 155)}
        ${pine(1255, 978, 120)}${pine(1340, 978, 160)}${pine(1415, 978, 110)}`;

    const groundSeal = `<g fill="${colors.fore}"><rect x="-80" y="930" width="1600" height="120"/></g>`;
    const rimLine = `<path d="M900 918 C1040 905 1180 922 1320 908 C1360 902 1400 912 1440 906" fill="none" stroke="${colors.rim}" stroke-width="2.2" stroke-linecap="round" opacity="0.9"/>`;

    return (
      plxGroup(0.22, `<g fill="${colors.far}">${farHills}</g>`, true) +
      plxGroup(0.55, `<g fill="${colors.mid}">${midHills}</g>`, true) +
      plxGroup(1.15, `<g fill="${colors.fore}">${treeBand}${rimLine}</g>`, true) +
      groundSeal
    );
  }

  function bindHeroParallax(hero, sceneEl) {
    if (!hero || !sceneEl) return () => {};

    const quality = sceneQuality();
    const baseEl = hero.querySelector(".hero-base");
    const contentEl = hero.querySelector(".hero-content");
    const cueEl = hero.querySelector(".hero-scroll-cue");
    const skyMetaEl = hero.querySelector(".hero-sky-meta");
    const pin = hero.closest(".hero-pin") || hero;

    function clearParallax() {
      hero.classList.remove("has-parallax", "is-parallaxing");
      hero.style.removeProperty("--hero-progress");
      sceneEl.style.setProperty("--plx-y", "0");
      if (baseEl) {
        baseEl.style.removeProperty("transform");
        baseEl.style.setProperty("--plx-y", "0");
      }
      if (contentEl) {
        contentEl.style.removeProperty("transform");
        contentEl.style.removeProperty("opacity");
        contentEl.style.removeProperty("filter");
      }
      if (cueEl) {
        cueEl.hidden = true;
        cueEl.style.removeProperty("opacity");
      }
      if (skyMetaEl) {
        skyMetaEl.style.removeProperty("--sky-stage-scale");
        skyMetaEl.style.removeProperty("--sky-stage-y");
        skyMetaEl.style.removeProperty("--sky-stage-glow");
      }
      sceneEl.querySelectorAll(".plx-layer").forEach((layer) => {
        layer.removeAttribute("transform");
        layer.style.removeProperty("transform");
      });
      const svg = sceneEl.querySelector("svg");
      if (svg && svg.dataset.baseViewBox) {
        svg.setAttribute("viewBox", svg.dataset.baseViewBox);
      }
    }

    if (!quality.parallax) {
      clearParallax();
      return () => {};
    }

    hero.classList.add("has-parallax");
    if (cueEl) cueEl.hidden = false;
    let ticking = false;
    let visible = true;
    let scrollEndTimer = 0;
    let maxTravel = 360;
    let isMobile = false;

    function refreshMaxTravel() {
      isMobile = window.matchMedia("(max-width: 700px)").matches;
      maxTravel = isMobile ? 260 : 360;
    }

    function frameMobileSky(progress) {
      const svg = sceneEl.querySelector("svg");
      if (!svg) return;
      if (!svg.dataset.baseViewBox) {
        svg.dataset.baseViewBox = svg.getAttribute("viewBox") || "0 0 1440 980";
      }
      if (!isMobile) {
        svg.setAttribute("viewBox", svg.dataset.baseViewBox);
        svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
        return;
      }
      // Frame sun in the mid stage band; hills anchor above the card
      const x = 600 - progress * 48;
      const y = 200 - progress * 120;
      const w = 820 - progress * 100;
      const h = 700 - progress * 60;
      svg.setAttribute("viewBox", `${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`);
      svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
    }

    function readDepth(layer) {
      const raw =
        layer.style.getPropertyValue("--plx-depth") ||
        layer.getAttribute("data-depth") ||
        "0";
      const depth = Number.parseFloat(raw);
      return Number.isFinite(depth) ? depth : 0;
    }

    function update() {
      ticking = false;
      if (!visible) return;

      const range = Math.max(1, pin.offsetHeight - hero.offsetHeight);
      const progress = Math.min(1, Math.max(0, -pin.getBoundingClientRect().top / range));
      const y = progress * maxTravel;
      const value = y.toFixed(2);
      const content = hero.querySelector(".hero-content");
      const cue = hero.querySelector(".hero-scroll-cue");
      const skyMeta = hero.querySelector(".hero-sky-meta");

      hero.style.setProperty("--hero-progress", progress.toFixed(3));
      frameMobileSky(progress);
      sceneEl.style.setProperty("--plx-y", value);
      sceneEl.querySelectorAll(".plx-layer").forEach((layer) => {
        const depth = readDepth(layer);
        const xRaw = Number.parseFloat(layer.style.getPropertyValue("--plx-x"));
        const yRaw = Number.parseFloat(layer.style.getPropertyValue("--plx-y-factor"));
        const xOff = Number.isFinite(xRaw) ? y * xRaw : 0;
        const yOff = Number.isFinite(yRaw) ? y * yRaw : -y * depth;
        layer.setAttribute("transform", `translate(${xOff.toFixed(2)} ${yOff.toFixed(2)})`);
      });

      const base = hero.querySelector(".hero-base");
      if (base) {
        base.style.setProperty("--plx-y", value);
        base.style.transform = `translate3d(0, ${(-y * 0.1).toFixed(2)}px, 0)`;
      }

      if (content) {
        const lift = isMobile ? 90 : 72;
        const fade = isMobile
          ? Math.max(0, 1 - progress * 1.15)
          : Math.max(0.3, 1 - progress * 0.5);
        content.style.transform = `translate3d(0, ${(-progress * lift).toFixed(2)}px, 0)`;
        content.style.opacity = String(fade);
        // Soft exit only — hard blur reads muddy on light golden-hour skies
        if (isMobile && progress > 0.2) {
          content.style.filter = `blur(${((progress - 0.2) * 3.2).toFixed(2)}px)`;
        } else {
          content.style.removeProperty("filter");
        }
      }

      if (skyMeta) {
        if (isMobile) {
          // Card stays docked; glow tracks the sky bloom
          skyMeta.style.setProperty("--sky-stage-scale", "1");
          skyMeta.style.setProperty("--sky-stage-y", `${(-progress * 10).toFixed(1)}px`);
          skyMeta.style.setProperty("--sky-stage-glow", (0.7 + progress * 0.3).toFixed(3));
        } else {
          const scale = 1 + progress * 0.1;
          const stageY = -progress * 16;
          const glow = 0.55 + progress * 0.2;
          skyMeta.style.setProperty("--sky-stage-scale", scale.toFixed(3));
          skyMeta.style.setProperty("--sky-stage-y", `${stageY.toFixed(1)}px`);
          skyMeta.style.setProperty("--sky-stage-glow", glow.toFixed(3));
        }
      }

      if (cue) {
        if (isMobile) {
          cue.hidden = true;
        } else {
          cue.hidden = false;
          cue.style.opacity = String(Math.max(0, 1 - progress * 2.8));
        }
      }

      if (typeof window.__portfolioUpdateQualityDebug === "function") {
        window.__portfolioUpdateQualityDebug({
          plxY: value,
          progress: progress.toFixed(3)
        });
      }
    }

    function requestUpdate() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    function onScroll() {
      if (!hero.classList.contains("is-parallaxing")) {
        hero.classList.add("is-parallaxing");
      }
      window.clearTimeout(scrollEndTimer);
      scrollEndTimer = window.setTimeout(() => {
        hero.classList.remove("is-parallaxing");
      }, 140);
      requestUpdate();
    }

    function onResize() {
      refreshMaxTravel();
      requestUpdate();
    }

    refreshMaxTravel();
    requestUpdate();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    let io = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          visible = entries.some((entry) => entry.isIntersecting);
          if (visible) requestUpdate();
          else hero.classList.remove("is-parallaxing");
        },
        { threshold: 0 }
      );
      io.observe(pin);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(scrollEndTimer);
      if (io) io.disconnect();
      clearParallax();
    };
  }

  function buildNexusScene(quality) {
    const q = quality || sceneQuality();
    const blurDef = q.lite
      ? ""
      : `<filter id="nxBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16"/></filter>`;
    const blurAttr = q.lite ? "" : ` filter="url(#nxBlur)"`;
    const particles = q.lite
      ? `<circle cx="720" cy="160" r="5" fill="#d9772f"/><circle cx="1420" cy="140" r="4" fill="#7ad7ff"/><circle cx="1480" cy="520" r="4.5" fill="#f0b27a"/>`
      : q.reduced
        ? `<circle cx="720" cy="160" r="5" fill="#d9772f"/><circle cx="1420" cy="140" r="4" fill="#7ad7ff"/><circle cx="1480" cy="520" r="4.5" fill="#f0b27a"/><circle cx="760" cy="680" r="4" fill="#ffffff" opacity="0.9"/><circle cx="980" cy="100" r="3.5" fill="#7ad7ff"/>`
        : `<circle r="5" fill="#d9772f"><animateMotion dur="2.8s" repeatCount="indefinite" path="M720 160 L1120 420"/></circle>
            <circle r="4" fill="#7ad7ff"><animateMotion dur="3.2s" begin="0.5s" repeatCount="indefinite" path="M1420 140 L1120 420"/></circle>
            <circle r="4.5" fill="#f0b27a"><animateMotion dur="2.6s" begin="1s" repeatCount="indefinite" path="M1480 520 L1120 420"/></circle>
            <circle r="4" fill="#ffffff" opacity="0.9"><animateMotion dur="3.4s" begin="0.3s" repeatCount="indefinite" path="M760 680 L1120 420"/></circle>
            <circle r="3.5" fill="#7ad7ff"><animateMotion dur="2.4s" begin="1.4s" repeatCount="indefinite" path="M980 100 L1120 420"/></circle>`;
    const spokes = q.lite
      ? `<path class="is-flow-fast nx-spoke" d="M720 160 L1120 420"/><path class="is-flow nx-spoke" d="M1420 140 L1120 420" style="animation-delay:0.3s"/><path class="is-flow nx-spoke" d="M760 680 L1120 420" style="animation-delay:0.9s"/>`
      : `<path class="is-flow-fast nx-spoke" d="M720 160 L1120 420"/>
            <path class="is-flow nx-spoke" d="M1420 140 L1120 420" style="animation-delay:0.3s"/>
            <path class="is-flow-fast nx-spoke" d="M1480 520 L1120 420" style="animation-delay:0.6s"/>
            <path class="is-flow nx-spoke" d="M760 680 L1120 420" style="animation-delay:0.9s"/>
            <path class="is-flow nx-spoke" d="M980 100 L1120 420" style="animation-delay:0.15s"/>
            <path class="is-flow-fast nx-spoke" d="M1320 740 L1120 420" style="animation-delay:0.45s"/>`;

    return `<svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="nxBeam" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#7ad7ff" stop-opacity="0"/>
              <stop offset="55%" stop-color="#5ad0d8" stop-opacity="0.7"/>
              <stop offset="100%" stop-color="#d9772f" stop-opacity="0.95"/>
            </linearGradient>
            <radialGradient id="nxCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#fff4e8" stop-opacity="1"/>
              <stop offset="18%" stop-color="#f0b27a" stop-opacity="0.85"/>
              <stop offset="48%" stop-color="#d9772f" stop-opacity="0.4"/>
              <stop offset="100%" stop-color="#d9772f" stop-opacity="0"/>
            </radialGradient>
            ${blurDef}
          </defs>
          <g class="nx-stage" style="transform-box:fill-box;transform-origin:1120px 420px">
          <circle class="is-breathe nx-bloom" cx="1120" cy="420" r="210" fill="url(#nxCore)"${blurAttr} opacity="0.85"/>
          <g fill="none" stroke="rgba(197,213,219,0.14)" stroke-width="1">
            <path d="M700 80 L1120 420 L700 760"/><path d="M1480 80 L1120 420 L1480 760"/>
            <path d="M620 280 L1120 420 L1620 280"/><path d="M620 560 L1120 420 L1620 560"/>
            ${q.lite ? "" : `<path d="M860 40 L1120 420 L1380 800"/><path d="M1380 40 L1120 420 L860 800"/>`}
          </g>
          <g class="nx-beams" fill="none" stroke="url(#nxBeam)" stroke-width="2.2" stroke-linecap="round">${spokes}</g>
          <g fill="none" stroke="rgba(240,178,122,0.35)" stroke-width="1.5">
            <circle class="is-ring" cx="1120" cy="420" r="56"/>
            ${q.lite ? "" : `<circle class="is-ring" cx="1120" cy="420" r="56" style="animation-delay:1.6s"/><circle class="is-ring" cx="1120" cy="420" r="56" style="animation-delay:3.2s"/>`}
            <circle cx="1120" cy="420" r="96" opacity="0.5"/>
            <circle cx="1120" cy="420" r="148" opacity="0.28"/>
          </g>
          <circle class="is-pulse nx-hub" cx="1120" cy="420" r="14" fill="#d9772f"/>
          <circle cx="1120" cy="420" r="26" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1.6"/>
          <g>
            <circle class="is-pulse" cx="720" cy="160" r="8" fill="#7ad7ff"/>
            <circle class="is-pulse" cx="1420" cy="140" r="7" fill="#f0b27a" style="animation-delay:0.5s"/>
            <circle class="is-pulse" cx="1480" cy="520" r="8" fill="#7ad7ff" style="animation-delay:1s"/>
            ${q.lite ? "" : `<circle class="is-pulse" cx="760" cy="680" r="9" fill="#d9772f" style="animation-delay:0.3s"/><circle class="is-pulse" cx="980" cy="100" r="6" fill="#c5d5db" style="animation-delay:0.7s"/><circle class="is-pulse" cx="1320" cy="740" r="7" fill="#f0b27a" style="animation-delay:1.2s"/>`}
          </g>
          <g>${particles}</g>
          </g>
        </svg>`;
  }

  function bindPortfolioScrollStage(root, sceneEl) {
    if (!root || !sceneEl) return () => {};

    const quality = sceneQuality();
    const pin = root.closest(".portfolio-intro-pin") || root;
    const contentEl = root.querySelector(".portfolio-intro-content");
    const cueEl = root.querySelector(".portfolio-intro-scroll");
    const stageEl = sceneEl.querySelector(".nx-stage");
    const hubEl = sceneEl.querySelector(".nx-hub");
    const bloomEl = sceneEl.querySelector(".nx-bloom");
    const spokes = sceneEl.querySelectorAll(".nx-spoke");

    function clearStage() {
      pin.classList.remove("is-scroll-stage");
      root.classList.remove("is-staging", "is-staging-active");
      root.style.removeProperty("--nx-progress");
      if (contentEl) {
        contentEl.style.removeProperty("transform");
        contentEl.style.removeProperty("opacity");
        contentEl.style.removeProperty("filter");
      }
      if (cueEl) cueEl.style.removeProperty("opacity");
      if (stageEl) stageEl.removeAttribute("transform");
      if (hubEl) hubEl.removeAttribute("transform");
      if (bloomEl) bloomEl.style.removeProperty("opacity");
      spokes.forEach((spoke) => {
        spoke.style.removeProperty("stroke-dasharray");
        spoke.style.removeProperty("stroke-dashoffset");
      });
    }

    if (!quality.parallax) {
      clearStage();
      return () => {};
    }

    pin.classList.add("is-scroll-stage");
    root.classList.add("is-staging");
    spokes.forEach((spoke) => {
      const len = typeof spoke.getTotalLength === "function" ? spoke.getTotalLength() : 420;
      spoke.dataset.nxLen = String(len);
      spoke.style.strokeDasharray = String(len);
      spoke.style.strokeDashoffset = String(len * 0.72);
    });

    let ticking = false;
    let visible = true;
    let scrollEndTimer = 0;
    let isMobile = false;

    function refreshMobile() {
      isMobile = window.matchMedia("(max-width: 700px)").matches;
    }

    function update() {
      ticking = false;
      if (!visible) return;

      const range = Math.max(1, pin.offsetHeight - root.offsetHeight);
      const progress = Math.min(1, Math.max(0, -pin.getBoundingClientRect().top / range));
      root.style.setProperty("--nx-progress", progress.toFixed(3));

      const lift = isMobile ? 100 : 56;
      const fade = Math.max(0, 1 - progress * (isMobile ? 1.2 : 0.85));
      if (contentEl) {
        contentEl.style.transform = `translate3d(0, ${(-progress * lift).toFixed(2)}px, 0)`;
        contentEl.style.opacity = String(fade);
        if (isMobile) {
          contentEl.style.filter = progress > 0.1 ? `blur(${(progress * 4.5).toFixed(2)}px)` : "none";
        } else {
          contentEl.style.removeProperty("filter");
        }
      }

      const bloom = 1 + progress * (isMobile ? 0.55 : 0.28);
      if (stageEl) {
        stageEl.setAttribute("transform", `translate(1120 420) scale(${bloom.toFixed(3)}) translate(-1120 -420)`);
      }
      if (hubEl) {
        const hubScale = 1 + progress * (isMobile ? 1.35 : 0.7);
        hubEl.setAttribute("transform", `translate(1120 420) scale(${hubScale.toFixed(3)}) translate(-1120 -420)`);
      }
      if (bloomEl) {
        bloomEl.style.opacity = String(Math.min(1, 0.55 + progress * 0.45));
      }

      spokes.forEach((spoke) => {
        const len = Number.parseFloat(spoke.dataset.nxLen) || 420;
        const drawn = Math.min(1, progress * 1.35);
        spoke.style.strokeDashoffset = String(len * (0.72 - drawn * 0.72));
      });

      if (cueEl) {
        // Rise mid-scroll, then ease out as the catalog docks
        const cueOpacity = progress < 0.55
          ? Math.min(1, 0.35 + progress * 1.4)
          : Math.max(0, 1 - (progress - 0.55) * 2.4);
        cueEl.style.opacity = String(cueOpacity);
      }
    }

    function requestUpdate() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    function onScroll() {
      if (!root.classList.contains("is-staging-active")) {
        root.classList.add("is-staging-active");
      }
      window.clearTimeout(scrollEndTimer);
      scrollEndTimer = window.setTimeout(() => {
        root.classList.remove("is-staging-active");
      }, 140);
      requestUpdate();
    }

    function onResize() {
      refreshMobile();
      requestUpdate();
    }

    refreshMobile();
    requestUpdate();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    let io = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          visible = entries.some((entry) => entry.isIntersecting);
          if (visible) requestUpdate();
          else root.classList.remove("is-staging-active");
        },
        { threshold: 0 }
      );
      io.observe(pin);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(scrollEndTimer);
      if (io) io.disconnect();
      clearStage();
    };
  }

  function buildSkyclockScene(phase, quality, skyId) {
    const q = quality || sceneQuality();
    const SIGS = {
      local: {
        sunX: 1180,
        core: "#fff4e0",
        mid: "#f0b27a",
        accent: "#7ad7ff",
        star: "#dfe7f5",
        motif: "brand"
      },
      pacific: {
        sunX: 1300,
        core: "#e8fff8",
        mid: "#5ec8d4",
        accent: "#ff9a6a",
        star: "#c8f0f5",
        motif: "haze"
      },
      atlantic: {
        sunX: 1040,
        core: "#eef2ff",
        mid: "#7aa8ff",
        accent: "#ffb070",
        star: "#d0dcff",
        motif: "bands"
      },
      london: {
        sunX: 1120,
        core: "#f4f2ea",
        mid: "#a8b4c0",
        accent: "#e8c090",
        star: "#e8ece8",
        motif: "fog"
      },
      reykjavik: {
        sunX: 980,
        core: "#e8fff4",
        mid: "#7dffc8",
        accent: "#a090ff",
        star: "#c8ffe8",
        motif: "aurora"
      },
      dubai: {
        sunX: 1260,
        core: "#fff6d8",
        mid: "#ffc878",
        accent: "#e07040",
        star: "#ffe8c0",
        motif: "heat"
      },
      tokyo: {
        sunX: 1340,
        core: "#fff0f5",
        mid: "#ff8fb8",
        accent: "#9ec5ff",
        star: "#ffd0e0",
        motif: "bloom"
      },
      sydney: {
        sunX: 1200,
        core: "#e8f8ff",
        mid: "#6ed0ff",
        accent: "#ffd28a",
        star: "#b8e8ff",
        motif: "cross"
      }
    };
    const sig = SIGS[skyId] || SIGS.local;
    const sunX = sig.sunX;
    const sunY =
      {
        late: 220,
        dawn: 560,
        morning: 320,
        day: 190,
        golden: 360,
        sunset: 450,
        dusk: 600,
        night: 240
      }[phase] || 210;

    const blurDef = q.lite
      ? ""
      : `<filter id="scBlur" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="20"/></filter>`;
    const blurAttr = q.lite ? "" : ` filter="url(#scBlur)"`;

    function motionDot(fill, dur, begin, path) {
      if (q.lite || q.reduced) {
        return `<circle cx="${sunX}" cy="${Math.min(sunY + 80, 700)}" r="4" fill="${fill}" opacity="0.85"/>`;
      }
      const beginAttr = begin ? ` begin="${begin}"` : "";
      return `<circle r="4.2" fill="${fill}"><animateMotion dur="${dur}"${beginAttr} repeatCount="indefinite" path="${path}"/></circle>`;
    }

    function stars(opacity, count, shift) {
      if (opacity <= 0) return "";
      const dx = shift || 0;
      const pts = [
        [860 + dx, 140, 1.5],
        [980 + dx, 220, 1.2],
        [1100 + dx, 120, 1.8],
        [1320 + dx, 180, 1.3],
        [1400 + dx, 320, 1.4],
        [920 + dx, 360, 1.1],
        [1260 + dx, 420, 1.6],
        [1040 + dx, 480, 1.2],
        [1180 + dx, 90, 1.4],
        [1500 + dx, 260, 1.1],
        [780 + dx, 280, 1.3],
        [1360 + dx, 500, 1.2],
        [900 + dx, 80, 1.0],
        [1480 + dx, 400, 1.5]
      ].slice(0, q.lite ? Math.min(4, count) : count);
      return `<g fill="${sig.star}" opacity="${opacity}">${pts
        .map(
          ([x, y, r], i) =>
            `<circle class="is-float" cx="${x}" cy="${y}" r="${r}" style="animation-delay:${(i % 5) * 0.55}s"/>`
        )
        .join("")}</g>`;
    }

    function motifLayer() {
      if (q.lite && sig.motif !== "cross" && sig.motif !== "aurora") return "";
      switch (sig.motif) {
        case "haze":
          return `<g fill="${sig.mid}" opacity="0.18">
            <ellipse class="is-float" cx="${sunX - 180}" cy="380" rx="220" ry="36"/>
            <ellipse class="is-float" cx="${sunX + 40}" cy="460" rx="260" ry="42" style="animation-delay:1.6s"/>
            ${q.lite ? "" : `<ellipse class="is-float" cx="${sunX - 60}" cy="520" rx="180" ry="28" style="animation-delay:2.8s"/>`}
          </g>`;
        case "bands":
          return `<g fill="none" stroke="${sig.accent}" stroke-width="1.2" opacity="0.28" stroke-linecap="round">
            <path class="is-flow" d="M640 280 C820 240 1000 320 ${sunX} 260"/>
            <path class="is-flow" d="M660 360 C880 300 1080 380 ${sunX + 40} 340" style="animation-delay:0.5s"/>
            ${q.lite ? "" : `<path class="is-flow" d="M700 440 C920 400 1120 460 ${sunX} 420" style="animation-delay:1s"/>`}
          </g>`;
        case "fog":
          return `<g fill="${sig.core}" opacity="0.22">
            <ellipse class="is-float" cx="980" cy="420" rx="240" ry="70"/>
            <ellipse class="is-float" cx="1240" cy="500" rx="280" ry="80" style="animation-delay:2s"/>
            ${q.lite ? "" : `<ellipse class="is-float" cx="1100" cy="340" rx="200" ry="50" opacity="0.7" style="animation-delay:1s"/>`}
          </g>`;
        case "aurora":
          return `<g fill="none" stroke-linecap="round" opacity="0.55">
            <path class="is-flow" d="M700 180 C860 80 1040 220 1220 100 C1320 40 1400 160 1480 90" stroke="${sig.mid}" stroke-width="3"/>
            <path class="is-flow" d="M720 240 C900 140 1100 280 1300 160" stroke="${sig.accent}" stroke-width="2.2" style="animation-delay:0.7s"/>
            ${q.lite ? "" : `<path class="is-flow" d="M760 300 C960 200 1160 320 1380 220" stroke="${sig.star}" stroke-width="1.6" style="animation-delay:1.4s"/>`}
          </g>`;
        case "heat":
          return `<g fill="none" stroke="${sig.mid}" stroke-width="1.4" opacity="0.3" stroke-linecap="round">
            <path class="is-breathe" d="M${sunX - 40} 520 Q${sunX - 20} 480 ${sunX} 520 Q${sunX + 20} 560 ${sunX + 40} 520"/>
            <path class="is-breathe" d="M${sunX - 80} 580 Q${sunX - 40} 540 ${sunX} 580 Q${sunX + 40} 620 ${sunX + 80} 580" style="animation-delay:0.8s"/>
            ${q.lite ? "" : `<path class="is-breathe" d="M${sunX - 120} 640 Q${sunX - 60} 600 ${sunX} 640 Q${sunX + 60} 680 ${sunX + 120} 640" style="animation-delay:1.6s"/>`}
          </g>`;
        case "bloom":
          return `<g fill="${sig.mid}" opacity="0.45">
            <circle class="is-pulse" cx="${sunX - 120}" cy="300" r="5"/>
            <circle class="is-pulse" cx="${sunX + 90}" cy="260" r="4" style="animation-delay:0.4s"/>
            <circle class="is-pulse" cx="${sunX - 40}" cy="200" r="3.5" style="animation-delay:0.8s"/>
            ${q.lite ? "" : `<circle class="is-pulse" cx="${sunX + 160}" cy="340" r="4.5" style="animation-delay:1.2s"/><circle class="is-float" cx="${sunX - 200}" cy="380" r="6" fill="${sig.accent}" opacity="0.5"/>`}
          </g>`;
        case "cross":
          return `<g fill="${sig.star}" opacity="0.85">
            <circle cx="${sunX - 40}" cy="160" r="2.4"/>
            <circle cx="${sunX - 10}" cy="200" r="3.2"/>
            <circle cx="${sunX + 20}" cy="250" r="2.2"/>
            <circle cx="${sunX + 55}" cy="185" r="1.8"/>
            ${q.lite ? "" : `<circle class="is-float" cx="${sunX + 100}" cy="300" r="1.4" opacity="0.6"/>`}
          </g>`;
        default:
          return `<g>
            <circle class="is-pulse" cx="${sunX - 200}" cy="240" r="6" fill="${sig.accent}" opacity="0.7"/>
            <circle class="is-pulse" cx="${sunX + 160}" cy="300" r="5" fill="${sig.mid}" opacity="0.65" style="animation-delay:0.6s"/>
          </g>`;
      }
    }

    const pathToSun = `M720 720 C900 560 1040 400 ${sunX} ${sunY + 20}`;
    let body = "";

    if (phase === "late") {
      body = `${stars(0.9, 14, sunX - 1180)}
        ${motifLayer()}
        ${wrapCelestial(
          phase,
          q,
          `<circle class="is-breathe" cx="${sunX}" cy="${sunY}" r="48" fill="${sig.core}" opacity="0.55"/>
        <circle cx="${sunX + 18}" cy="${sunY - 16}" r="42" fill="#040810"/>
        <g fill="none" stroke="${sig.accent}" stroke-width="1.2" opacity="0.35">
          <circle class="is-ring" cx="${sunX}" cy="${sunY}" r="70"/>
          ${q.lite ? "" : `<circle class="is-ring" cx="${sunX}" cy="${sunY}" r="110" style="animation-delay:2s"/>`}
        </g>`
        )}
        <g>${motionDot(sig.accent, "5.5s", "", pathToSun)}${
          q.lite ? "" : motionDot(sig.mid, "6.8s", "1.1s", `M1400 760 C1280 580 1180 400 ${sunX} ${sunY + 20}`)
        }</g>`;
    } else if (phase === "night") {
      body = `${stars(0.72, 12, sunX - 1180)}
        ${motifLayer()}
        ${wrapCelestial(
          phase,
          q,
          `<circle class="is-breathe" cx="${sunX}" cy="${sunY}" r="58" fill="${sig.core}" opacity="0.92"/>
        <circle cx="${sunX + 22}" cy="${sunY - 18}" r="48" fill="#071018"/>
        <g fill="none" stroke="${sig.accent}" stroke-width="1.4" opacity="0.4">
          <circle class="is-ring" cx="${sunX}" cy="${sunY}" r="74"/>
          ${q.lite ? "" : `<circle class="is-ring" cx="${sunX}" cy="${sunY}" r="74" style="animation-delay:1.8s"/>`}
        </g>`
        )}
        <g>${motionDot(sig.accent, "5s", "", pathToSun)}${
          q.lite ? "" : motionDot(sig.mid, "6.2s", "1s", `M1400 720 C1320 540 1240 380 ${sunX} ${sunY + 20}`)
        }</g>`;
    } else if (phase === "dusk") {
      body = `<defs>
          <radialGradient id="scSun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${sig.core}" stop-opacity="0.9"/>
            <stop offset="45%" stop-color="${sig.mid}" stop-opacity="0.5"/>
            <stop offset="100%" stop-color="${sig.accent}" stop-opacity="0"/>
          </radialGradient>
          ${blurDef}
        </defs>
        ${stars(0.38, 9, sunX - 1180)}
        ${motifLayer()}
        ${wrapCelestial(
          phase,
          q,
          `<ellipse class="is-breathe" cx="${sunX}" cy="${sunY}" rx="320" ry="120" fill="url(#scSun)"${blurAttr}/>
        <circle cx="${sunX}" cy="${sunY}" r="36" fill="${sig.mid}" opacity="0.8"/>`
        )}
        <g fill="none" stroke-linecap="round">
          <path class="is-flow" d="M640 600 C860 560 1080 640 ${sunX + 60} 580" stroke="${sig.accent}" stroke-width="1.8" opacity="0.45"/>
          ${q.lite ? "" : `<path class="is-flow" d="M700 700 C940 660 1160 720 ${sunX + 120} 680" stroke="${sig.mid}" stroke-width="1.4" opacity="0.35" style="animation-delay:0.6s"/>`}
        </g>
        <g>${motionDot(sig.accent, "5.2s", "", `M640 600 C860 560 1080 640 ${sunX + 60} 580`)}</g>`;
    } else if (phase === "sunset") {
      body = `<defs>
          <radialGradient id="scSun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${sig.core}" stop-opacity="1"/>
            <stop offset="40%" stop-color="${sig.mid}" stop-opacity="0.75"/>
            <stop offset="100%" stop-color="${sig.accent}" stop-opacity="0"/>
          </radialGradient>
          ${blurDef}
        </defs>
        ${stars(0.2, 6, sunX - 1180)}
        ${motifLayer()}
        ${wrapCelestial(
          phase,
          q,
          `<ellipse class="is-breathe" cx="${sunX}" cy="${sunY}" rx="330" ry="155" fill="url(#scSun)"${blurAttr}/>
        <circle class="is-glow" cx="${sunX}" cy="${sunY}" r="62" fill="url(#scSun)"/>`
        )}
        <g fill="none" stroke-linecap="round">
          <path class="is-flow" d="M640 560 C820 520 1000 600 ${sunX} 540 C${sunX + 120} 508 ${sunX + 200} 560 ${sunX + 280} 530" stroke="${sig.accent}" stroke-width="2" opacity="0.5"/>
          ${q.lite ? "" : `<path class="is-flow" d="M620 640 C860 590 1080 600 ${sunX + 80} 660" stroke="${sig.mid}" stroke-width="1.6" opacity="0.35" style="animation-delay:0.5s"/>`}
        </g>
        <g>${motionDot(sig.accent, "4.8s", "", `M640 560 C820 520 1000 600 ${sunX} 540`)}</g>`;
    } else if (phase === "golden") {
      body = `<defs>
          <radialGradient id="scSun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${sig.core}" stop-opacity="1"/>
            <stop offset="40%" stop-color="${sig.mid}" stop-opacity="0.65"/>
            <stop offset="100%" stop-color="${sig.accent}" stop-opacity="0"/>
          </radialGradient>
          ${blurDef}
        </defs>
        ${motifLayer()}
        ${wrapCelestial(
          phase,
          q,
          `<ellipse class="is-breathe" cx="${sunX}" cy="${sunY}" rx="300" ry="180" fill="url(#scSun)"${blurAttr} opacity="0.9"/>
        <circle cx="${sunX}" cy="${sunY}" r="52" fill="${sig.core}" opacity="0.95"/>`
        )}
        <g fill="${sig.core}" opacity="0.4">
          <ellipse class="is-float" cx="${sunX - 280}" cy="300" rx="140" ry="40"/>
          ${q.lite ? "" : `<ellipse class="is-float" cx="${sunX - 40}" cy="240" rx="110" ry="32" style="animation-delay:1.4s"/>`}
        </g>
        <g fill="none" stroke="${sig.accent}" stroke-width="1.3" opacity="0.3">
          <path class="is-draw" d="M680 700 C900 640 1120 760 ${sunX + 100} 680"/>
          ${q.lite ? "" : `<path class="is-draw" d="M740 780 C980 720 1200 820 ${sunX + 160} 750" style="animation-delay:1s"/>`}
        </g>
        <g>${motionDot(sig.mid, "5s", "", `M680 700 C900 640 1120 760 ${sunX + 100} 680`)}</g>`;
    } else if (phase === "dawn") {
      body = `<defs>
          <radialGradient id="scSun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${sig.core}" stop-opacity="0.95"/>
            <stop offset="50%" stop-color="${sig.mid}" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="${sig.accent}" stop-opacity="0"/>
          </radialGradient>
          ${blurDef}
        </defs>
        ${stars(0.24, 6, sunX - 1180)}
        ${motifLayer()}
        <circle cx="${sunX - 200}" cy="150" r="16" fill="${sig.star}" opacity="0.35"/>
        ${wrapCelestial(
          phase,
          q,
          `<ellipse class="is-breathe" cx="${sunX}" cy="${sunY}" rx="280" ry="160" fill="url(#scSun)"${blurAttr} opacity="0.85"/>
        <circle cx="${sunX}" cy="${sunY}" r="40" fill="${sig.mid}" opacity="0.9"/>`
        )}
        <g fill="${sig.core}" opacity="0.4">
          <ellipse class="is-float" cx="${sunX - 260}" cy="300" rx="150" ry="44"/>
          ${q.lite ? "" : `<ellipse class="is-float" cx="${sunX + 80}" cy="380" rx="170" ry="50" style="animation-delay:2s"/>`}
        </g>
        <g fill="none" stroke="${sig.accent}" stroke-width="1.3" opacity="0.28">
          <path class="is-draw" d="M700 680 C900 620 1100 720 ${sunX + 80} 650"/>
          ${q.lite ? "" : `<path class="is-draw" d="M760 760 C980 710 1180 800 ${sunX + 140} 730" style="animation-delay:1s"/>`}
        </g>`;
    } else if (phase === "morning") {
      body = `<defs>
          <radialGradient id="scSun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${sig.core}" stop-opacity="0.98"/>
            <stop offset="45%" stop-color="${sig.mid}" stop-opacity="0.42"/>
            <stop offset="100%" stop-color="${sig.accent}" stop-opacity="0"/>
          </radialGradient>
          ${blurDef}
        </defs>
        ${motifLayer()}
        ${wrapCelestial(
          phase,
          q,
          `<ellipse class="is-breathe" cx="${sunX}" cy="${sunY}" rx="290" ry="190" fill="url(#scSun)"${blurAttr} opacity="0.88"/>
        <circle cx="${sunX}" cy="${sunY}" r="46" fill="${sig.core}" opacity="0.92"/>`
        )}
        <g fill="${sig.core}" opacity="0.5">
          <ellipse class="is-float" cx="${sunX - 240}" cy="280" rx="155" ry="46"/>
          <ellipse class="is-float" cx="${sunX + 60}" cy="360" rx="175" ry="52" style="animation-delay:1.8s"/>
          ${q.lite ? "" : `<ellipse class="is-float" cx="${sunX - 80}" cy="420" rx="100" ry="30" style="animation-delay:3s"/>`}
        </g>
        <g fill="none" stroke="${sig.accent}" stroke-width="1.3" opacity="0.3">
          <path class="is-draw" d="M700 700 C920 640 1140 760 ${sunX + 60} 690"/>
          ${q.lite ? "" : `<path class="is-draw" d="M760 780 C980 720 1200 820 ${sunX + 120} 760" style="animation-delay:1s"/>`}
        </g>
        <g>${motionDot(sig.accent, "5.6s", "", `M700 700 C920 640 1140 760 ${sunX + 60} 690`)}</g>`;
    } else {
      body = `<defs>
          <radialGradient id="scSun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${sig.core}" stop-opacity="0.95"/>
            <stop offset="50%" stop-color="${sig.mid}" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="${sig.accent}" stop-opacity="0"/>
          </radialGradient>
          ${blurDef}
        </defs>
        ${motifLayer()}
        ${wrapCelestial(
          phase,
          q,
          `<ellipse class="is-breathe" cx="${sunX}" cy="${sunY}" rx="310" ry="215" fill="url(#scSun)"${blurAttr} opacity="0.85"/>
        <circle cx="${sunX}" cy="${sunY}" r="50" fill="${sig.core}" opacity="0.92"/>`
        )}
        <g fill="${sig.core}" opacity="0.55">
          <ellipse class="is-float" cx="${sunX - 260}" cy="260" rx="160" ry="50"/>
          <ellipse class="is-float" cx="${sunX + 40}" cy="340" rx="200" ry="58" style="animation-delay:2s"/>
          ${q.lite ? "" : `<ellipse class="is-float" cx="${sunX - 100}" cy="420" rx="120" ry="36" style="animation-delay:3.2s"/>`}
        </g>
        <g fill="none" stroke="${sig.accent}" stroke-width="1.3" opacity="0.3">
          <path class="is-draw" d="M700 680 C900 620 1100 720 ${sunX + 80} 650"/>
          ${q.lite ? "" : `<path class="is-draw" d="M760 760 C980 710 1180 800 ${sunX + 140} 730" style="animation-delay:1s"/>`}
        </g>
        <g>${motionDot(sig.accent, "6s", "", `M700 680 C900 620 1100 720 ${sunX + 80} 650`)}</g>`;
    }

    const parallaxOn = !!q.parallax;
    return `<svg viewBox="0 0 1440 980" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      ${parallaxOn ? plxGroup(0.1, body, true) : body}
      ${buildTerrainLayers(phase, q)}
    </svg>`;
  }


  /* Shared sky clock + site theme (Auto follows phase from chosen timezone). */
  const TZ_KEY = "portfolioHeroTzV1";
  const THEME_MODE_KEY = "portfolioThemeModeV1";
  const TIMEZONES = [
    { id: "local", label: "Your local time", iana: null, sky: "local" },
    { id: "America/Los_Angeles", label: "Los Angeles", iana: "America/Los_Angeles", sky: "pacific" },
    { id: "America/New_York", label: "New York", iana: "America/New_York", sky: "atlantic" },
    { id: "Europe/London", label: "London", iana: "Europe/London", sky: "london" },
    { id: "Atlantic/Reykjavik", label: "Reykjavik", iana: "Atlantic/Reykjavik", sky: "reykjavik" },
    { id: "Asia/Dubai", label: "Dubai", iana: "Asia/Dubai", sky: "dubai" },
    { id: "Asia/Tokyo", label: "Tokyo", iana: "Asia/Tokyo", sky: "tokyo" },
    { id: "Australia/Sydney", label: "Sydney", iana: "Australia/Sydney", sky: "sydney" }
  ];

  function hourInZone(iana) {
    if (!iana) {
      const d = new Date();
      return d.getHours() + d.getMinutes() / 60;
    }
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
        hourCycle: "h23",
        timeZone: iana
      }).formatToParts(new Date());
      const hour = Number(parts.find((p) => p.type === "hour")?.value);
      const minute = Number(parts.find((p) => p.type === "minute")?.value);
      if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
        throw new Error("Invalid hour parts");
      }
      return (hour === 24 ? 0 : hour) + minute / 60;
    } catch (err) {
      console.warn("Could not resolve timezone hour", { iana, message: err.message });
      const d = new Date();
      return d.getHours() + d.getMinutes() / 60;
    }
  }

  function getSavedTzId() {
    try {
      const id = localStorage.getItem(TZ_KEY) || "local";
      return TIMEZONES.some((z) => z.id === id) ? id : "local";
    } catch (err) {
      console.warn("Could not read timezone choice", err);
      return "local";
    }
  }

  function tzById(id) {
    return TIMEZONES.find((z) => z.id === id) || TIMEZONES[0];
  }

  function phaseFromHour(h) {
    if (h >= 4.5 && h < 6.5) return "dawn";
    if (h >= 6.5 && h < 10) return "morning";
    if (h >= 10 && h < 15) return "day";
    if (h >= 15 && h < 17) return "golden";
    if (h >= 17 && h < 19) return "sunset";
    if (h >= 19 && h < 21) return "dusk";
    if (h >= 21 && h < 24) return "night";
    return "late";
  }

  function resolvePhaseForTz(tz) {
    return phaseFromHour(hourInZone(tz?.iana || null));
  }

  function toneFor(phase) {
    return phase === "dawn" || phase === "morning" || phase === "day" || phase === "golden"
      ? "light"
      : "dark";
  }

  function getThemeMode() {
    try {
      const mode = localStorage.getItem(THEME_MODE_KEY) || "auto";
      return mode === "light" || mode === "dark" || mode === "auto" ? mode : "auto";
    } catch (err) {
      console.warn("Could not read theme mode", err);
      return "auto";
    }
  }

  function resolveSiteTheme(mode, tzId) {
    if (mode === "light" || mode === "dark") return mode;
    return toneFor(resolvePhaseForTz(tzById(tzId || getSavedTzId())));
  }

  function applySiteTheme(mode, tzId) {
    const theme = resolveSiteTheme(mode || getThemeMode(), tzId || getSavedTzId());
    document.documentElement.dataset.theme = theme;
    return theme;
  }

  (function initTheme() {
    const modeSelect = document.getElementById("theme-mode");
    let mode = getThemeMode();
    const AUTO_VIEW_LABEL = "Dark/Light Mode";
    const AUTO_MENU_LABEL = "Auto";

    function refresh() {
      applySiteTheme(mode, getSavedTzId());
    }

    function autoOption() {
      return modeSelect?.querySelector('option[value="auto"]') || null;
    }

    function setAutoLabel(open) {
      const opt = autoOption();
      if (!opt) return;
      opt.textContent = open ? AUTO_MENU_LABEL : AUTO_VIEW_LABEL;
    }

    if (modeSelect) {
      modeSelect.value = mode;
      setAutoLabel(false);
      modeSelect.addEventListener("mousedown", () => setAutoLabel(true));
      modeSelect.addEventListener("keydown", (e) => {
        if (e.key === " " || e.key === "Enter" || e.key === "ArrowDown" || e.key === "ArrowUp") {
          setAutoLabel(true);
        }
      });
      modeSelect.addEventListener("blur", () => setAutoLabel(false));
      modeSelect.addEventListener("change", () => {
        mode = modeSelect.value === "light" || modeSelect.value === "dark" ? modeSelect.value : "auto";
        try {
          localStorage.setItem(THEME_MODE_KEY, mode);
        } catch (err) {
          console.warn("Could not persist theme mode", err);
        }
        setAutoLabel(false);
        refresh();
      });
    }

    refresh();
    setInterval(() => {
      if (mode === "auto") refresh();
    }, 30000);

    window.__portfolioApplyTheme = refresh;
  })();

  /* Locked Skyclock hero — Auto phase + timezone; previewer removed. */
  (function initHero() {
    const hero = document.querySelector(".hero");
    if (!hero) return;

    const sceneEl = document.getElementById("hero-scene");
    const clockEl = document.getElementById("hero-clock");
    const skyMeta = document.getElementById("hero-sky-meta");
    const tzSelect = document.getElementById("hero-tz");
    let unbindParallax = () => {};

    function currentTz() {
      const id = tzSelect?.value || getSavedTzId();
      return tzById(id);
    }

    function formatClock(date, iana) {
      try {
        const opts = {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZoneName: "short"
        };
        if (iana) opts.timeZone = iana;
        return new Intl.DateTimeFormat(undefined, opts).format(date);
      } catch (err) {
        console.warn("Could not format clock", { iana, message: err.message });
        return date.toLocaleTimeString();
      }
    }

    const phaseLabels = {
      late: "Late night",
      dawn: "Dawn",
      morning: "Morning",
      day: "Day",
      golden: "Golden hour",
      sunset: "Sunset",
      dusk: "Dusk",
      night: "Nightlight"
    };

    function updateClock(phase) {
      if (!clockEl || !skyMeta) return;
      const hintEl = skyMeta.querySelector(".hero-sky-hint");
      const tz = currentTz();
      skyMeta.hidden = false;
      clockEl.textContent = `${formatClock(new Date(), tz.iana)} · ${phaseLabels[phase] || phase}`;
      if (hintEl) hintEl.textContent = "Sky follows your time.";
    }

    function ensureScrollCue() {
      let cue = hero.querySelector(".hero-scroll-cue");
      if (cue) return cue;
      cue = document.createElement("div");
      cue.className = "hero-scroll-cue";
      cue.hidden = true;
      cue.setAttribute("aria-hidden", "true");
      cue.innerHTML =
        '<span class="hero-scroll-cue-label">Scroll</span><span class="hero-scroll-cue-chevron"></span>';
      hero.appendChild(cue);
      return cue;
    }

    function ensureQualityDebug() {
      if (!isDevToolsEnabled()) return null;
      const tools = ensureDevTools();
      if (!tools) return null;

      let panel = document.getElementById("hero-quality-debug");
      if (panel) return panel;

      const host = tools.querySelector("#dev-tools-extra") || tools;
      panel = document.createElement("section");
      panel.id = "hero-quality-debug";
      panel.className = "dev-tools-section hero-quality-debug";
      panel.setAttribute("aria-label", "Scene quality");
      panel.innerHTML = `
        <h2 class="dev-tools-heading">Scene quality</h2>
        <p class="hqd-mode" id="hqd-mode">—</p>
        <p class="hqd-detail" id="hqd-detail"></p>
        <label class="hqd-force-label" for="hqd-force">
          <span>Force</span>
          <select id="hqd-force" aria-label="Force scene quality mode">
            <option value="auto">Auto detect</option>
            <option value="full">Force full</option>
            <option value="lite">Force lite</option>
          </select>
        </label>
        <p class="hqd-hint">Scroll while the hero is pinned — progress / <code>plx-y</code> should rise.</p>
      `;
      host.appendChild(panel);
      const forceSelect = panel.querySelector("#hqd-force");
      forceSelect.value = getSceneQualityForce();
      forceSelect.addEventListener("change", () => {
        setSceneQualityForce(forceSelect.value);
        apply();
      });
      return panel;
    }

    function updateQualityDebug(extra) {
      if (!isDevToolsEnabled()) return;
      const panel = ensureQualityDebug();
      if (!panel) return;
      const q = sceneQuality();
      const modeEl = panel.querySelector("#hqd-mode");
      const detailEl = panel.querySelector("#hqd-detail");
      const layers = sceneEl ? sceneEl.querySelectorAll(".plx-layer").length : 0;
      const armed = hero.classList.contains("has-parallax");
      const plxY =
        extra?.plxY ??
        sceneEl?.style.getPropertyValue("--plx-y") ??
        "0";
      const progress = extra?.progress ?? "—";
      const forceNote = q.force === "auto" ? "auto" : `forced ${q.force}`;
      modeEl.textContent = `${q.lite ? "LITE" : "FULL"} · parallax ${armed ? "ON" : "OFF"}`;
      modeEl.dataset.path = q.lite ? "lite" : "full";
      detailEl.textContent = `${forceNote} · layers ${layers} · progress ${progress} · plx-y ${plxY} · why: ${q.reasons.join(", ")}`;
    }

    window.__portfolioUpdateQualityDebug = updateQualityDebug;

    function apply() {
      const tz = currentTz();
      const phase = resolvePhaseForTz(tz);
      const quality = sceneQuality();
      const skyId = tz.sky || "local";

      hero.dataset.bg = `skyclock-${phase}`;
      hero.dataset.tone = toneFor(phase);
      hero.dataset.sky = skyId;
      hero.dataset.phase = phase;

      const pin = hero.closest(".hero-pin");
      if (pin) pin.classList.toggle("is-parallax-pin", !!quality.parallax);

      if (sceneEl) {
        injectScene(sceneEl, buildSkyclockScene(phase, quality, skyId), quality, () => {
          unbindParallax();
          unbindParallax = bindHeroParallax(hero, sceneEl);
          updateQualityDebug();
        });
      } else {
        updateQualityDebug();
      }
      updateClock(phase);

      try {
        if (tzSelect) localStorage.setItem(TZ_KEY, tzSelect.value);
      } catch (err) {
        console.warn("Could not persist timezone choice", err);
      }

      if (typeof window.__portfolioApplyTheme === "function") {
        window.__portfolioApplyTheme();
      }
    }

    if (tzSelect) {
      tzSelect.innerHTML = TIMEZONES.map(
        (z) => `<option value="${z.id}">${z.label}</option>`
      ).join("");
      const savedTz = getSavedTzId();
      tzSelect.value = savedTz;
      tzSelect.addEventListener("change", () => {
        try {
          localStorage.setItem(TZ_KEY, tzSelect.value);
        } catch (err) {
          console.warn("Could not persist timezone choice", err);
        }
        apply();
      });
    }

    ensureScrollCue();
    apply();
    setInterval(apply, 30000);
  })();

  try {
    ensureDevTools();
  } catch (err) {
    console.error("Dev tools failed to init", { message: err.message });
  }

  const THEMES = {
    crm: { bg0: "#062a33", bg1: "#0c5c6b", orb: "#3ec8d8", accent: "#f0b27a", ink: "#e8f4f6" },
    sync: { bg0: "#0b1f3a", bg1: "#124e6b", orb: "#7ad7ff", accent: "#d9772f", ink: "#e8f4f6" },
    match: { bg0: "#1a1230", bg1: "#3a2460", orb: "#c9a6ff", accent: "#f0b27a", ink: "#f3eaff" },
    forms: { bg0: "#132028", bg1: "#1d4a52", orb: "#8fd3c8", accent: "#e8923a", ink: "#eef6f4" },
    review: { bg0: "#102418", bg1: "#1d4d32", orb: "#8fe0a8", accent: "#f0b27a", ink: "#e8f6ec" },
    qr: { bg0: "#0a0e12", bg1: "#16323a", orb: "#d9772f", accent: "#ffb347", ink: "#f6efe4" },
    events: { bg0: "#2a1018", bg1: "#0f3d44", orb: "#ff8a6b", accent: "#f0b27a", ink: "#ffe8e0" },
    certificate: { bg0: "#2a1a0c", bg1: "#5a3a16", orb: "#f0c36a", accent: "#f4d78a", ink: "#fff4d8" },
    roster: { bg0: "#0d1c2c", bg1: "#1a3f5c", orb: "#7eb6d9", accent: "#d9772f", ink: "#e6f2fa" },
    transfer: { bg0: "#0e2a28", bg1: "#1f4d3e", orb: "#7ee0c4", accent: "#e07a4a", ink: "#e6f7f1" },
    canvas: { bg0: "#2c160e", bg1: "#7a3a1c", orb: "#ff9a4a", accent: "#ffd08a", ink: "#fff0e0" },
    mirror: { bg0: "#0c1a22", bg1: "#1a3a48", orb: "#6ee0f0", accent: "#d9772f", ink: "#e4f7fb" },
    catalog: { bg0: "#1c1810", bg1: "#3a4a38", orb: "#d4c48a", accent: "#e8923a", ink: "#f6f0dc" },
    sections: { bg0: "#12182a", bg1: "#243056", orb: "#8aa4ff", accent: "#f0b27a", ink: "#e8edff" },
    hubspot: { bg0: "#2a1408", bg1: "#8a3d14", orb: "#ff8a3a", accent: "#ffc078", ink: "#fff0e4" },
    web: { bg0: "#071820", bg1: "#0f4c5c", orb: "#5ad0d8", accent: "#d9772f", ink: "#e8f6f8" },
    pipeline: { bg0: "#1a1408", bg1: "#3a2a10", orb: "#f0c36a", accent: "#d9772f", ink: "#fff3d6" },
    ai: { bg0: "#10081c", bg1: "#2a1460", orb: "#b48cff", accent: "#f0b27a", ink: "#f0e8ff" },
    resources: { bg0: "#0c2018", bg1: "#1a4a38", orb: "#6ee0b0", accent: "#f0b27a", ink: "#e4f8ee" },
    finance: { bg0: "#1c1608", bg1: "#3a4a18", orb: "#d4e06a", accent: "#f0c36a", ink: "#f6f4d0" },
    helpdesk: { bg0: "#221018", bg1: "#4a2438", orb: "#ff8aaa", accent: "#f0b27a", ink: "#ffe8f0" },
    analytics: { bg0: "#081820", bg1: "#0f3a44", orb: "#5ad0a8", accent: "#d9772f", ink: "#e4f8f0" },
    cleanup: { bg0: "#18140c", bg1: "#2a3a28", orb: "#c5d5a0", accent: "#d9772f", ink: "#f0f4e4" },
    bike: { bg0: "#0c2230", bg1: "#1a5a68", orb: "#7ad0e8", accent: "#f0b27a", ink: "#e4f6fb" },
    ml: { bg0: "#10081c", bg1: "#241848", orb: "#9a7cff", accent: "#f0b27a", ink: "#eee8ff" },
    game: { bg0: "#141008", bg1: "#3a2810", orb: "#f0c36a", accent: "#e07a4a", ink: "#fff0d4" },
    address: { bg0: "#102018", bg1: "#2a4a28", orb: "#8fd38a", accent: "#f0b27a", ink: "#e8f6e4" },
    qrmail: { bg0: "#180c14", bg1: "#3a2040", orb: "#e8a0d0", accent: "#f0b27a", ink: "#fce8f4" },
    webhook: { bg0: "#08141c", bg1: "#0c3a4a", orb: "#5ae0ff", accent: "#d9772f", ink: "#e0f7ff" },
    groups: { bg0: "#14101c", bg1: "#2a2850", orb: "#a0b0ff", accent: "#f0b27a", ink: "#ececff" },
    portal: { bg0: "#1c1408", bg1: "#4a3010", orb: "#f0c36a", accent: "#ffd08a", ink: "#fff4dc" },
    redirect: { bg0: "#0c1820", bg1: "#1a4050", orb: "#6ad0c8", accent: "#d9772f", ink: "#e4f8f4" },
    overlap: { bg0: "#101828", bg1: "#203050", orb: "#80c0ff", accent: "#f0b27a", ink: "#e4f0ff" },
    learn: { bg0: "#10240c", bg1: "#2a5818", orb: "#8fe06a", accent: "#f0c36a", ink: "#eef8e0" },
    contacts: { bg0: "#0c1c24", bg1: "#1a4850", orb: "#70d0c8", accent: "#f0b27a", ink: "#e4f6f4" }
  };

  function dots(uid, color) {
    return `<pattern id="${uid}-dots" width="18" height="18" patternUnits="userSpaceOnUse">
      <circle cx="1.2" cy="1.2" r="1" fill="${color}" opacity="0.22"/>
    </pattern>`;
  }

  const scenes = {
    crm: (t) => `
      <circle cx="210" cy="78" r="46" fill="none" stroke="${t.orb}" stroke-width="1.5" opacity="0.45"/>
      <circle cx="210" cy="78" r="28" fill="none" stroke="${t.accent}" stroke-width="2"/>
      <circle cx="210" cy="78" r="7" fill="${t.accent}"/>
      <g fill="${t.ink}" opacity="0.92">
        <circle cx="64" cy="48" r="11"/><circle cx="108" cy="70" r="9"/><circle cx="72" cy="118" r="10"/>
      </g>
      <path d="M74 56 L198 70 M114 76 L186 78 M80 112 L188 88" stroke="${t.orb}" stroke-width="1.6" opacity="0.7"/>
      <rect x="28" y="142" width="70" height="8" rx="4" fill="${t.accent}"/>
      <rect x="106" y="142" width="44" height="8" rx="4" fill="${t.ink}" opacity="0.25"/>
    `,
    sync: (t) => `
      <circle cx="86" cy="90" r="40" fill="${t.ink}" opacity="0.08" stroke="${t.orb}" stroke-width="2"/>
      <circle cx="214" cy="90" r="40" fill="${t.ink}" opacity="0.08" stroke="${t.accent}" stroke-width="2"/>
      <path d="M126 72 C150 40 150 40 174 72" fill="none" stroke="${t.accent}" stroke-width="4" stroke-linecap="round"/>
      <path d="M174 108 C150 140 150 140 126 108" fill="none" stroke="${t.orb}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="150" cy="90" r="8" fill="${t.ink}"/>
      <circle cx="150" cy="54" r="5" fill="${t.accent}"/>
      <circle cx="150" cy="126" r="5" fill="${t.orb}"/>
    `,
    match: (t) => `
      <rect x="38" y="42" width="96" height="108" rx="14" fill="${t.ink}" opacity="0.08" stroke="${t.orb}" stroke-width="2"/>
      <rect x="166" y="42" width="96" height="108" rx="14" fill="${t.ink}" opacity="0.08" stroke="${t.accent}" stroke-width="2"/>
      <circle cx="86" cy="84" r="18" fill="${t.orb}" opacity="0.7"/>
      <circle cx="214" cy="84" r="18" fill="${t.accent}" opacity="0.85"/>
      <path d="M134 90 H166" stroke="${t.ink}" stroke-width="3" stroke-dasharray="5 6"/>
      <circle cx="150" cy="90" r="16" fill="#1a1230" stroke="${t.accent}" stroke-width="3"/>
      <path d="M143 90 L148 96 L159 82" fill="none" stroke="${t.accent}" stroke-width="3" stroke-linecap="round"/>
    `,
    forms: (t) => `
      <rect x="78" y="28" width="150" height="128" rx="10" fill="${t.ink}" opacity="0.06"/>
      <rect x="86" y="22" width="150" height="128" rx="10" fill="${t.bg1}" stroke="${t.orb}" stroke-width="2"/>
      <rect x="108" y="42" width="106" height="10" rx="5" fill="${t.ink}" opacity="0.35"/>
      <rect x="108" y="64" width="78" height="10" rx="5" fill="${t.ink}" opacity="0.2"/>
      <rect x="108" y="86" width="90" height="10" rx="5" fill="${t.ink}" opacity="0.2"/>
      <rect x="108" y="114" width="72" height="22" rx="11" fill="${t.accent}"/>
    `,
    review: (t) => `
      <rect x="32" y="36" width="236" height="112" rx="12" fill="${t.ink}" opacity="0.07" stroke="${t.orb}" stroke-width="2"/>
      <rect x="48" y="52" width="52" height="80" rx="8" fill="${t.accent}"/>
      <rect x="118" y="56" width="128" height="10" rx="5" fill="${t.ink}" opacity="0.35"/>
      <rect x="118" y="78" width="100" height="10" rx="5" fill="${t.ink}" opacity="0.2"/>
      <rect x="118" y="108" width="64" height="20" rx="10" fill="${t.orb}"/>
    `,
    qr: (t) => `
      <rect x="36" y="28" width="124" height="124" rx="10" fill="${t.ink}" opacity="0.06" stroke="${t.accent}" stroke-width="3"/>
      <rect x="52" y="44" width="32" height="32" fill="${t.accent}"/>
      <rect x="112" y="44" width="32" height="32" fill="${t.ink}" opacity="0.55"/>
      <rect x="52" y="104" width="32" height="32" fill="${t.ink}" opacity="0.55"/>
      <rect x="112" y="104" width="14" height="14" fill="${t.accent}"/>
      <rect x="132" y="124" width="14" height="14" fill="${t.orb}"/>
      <rect x="88" y="88" width="16" height="16" fill="${t.accent}"/>
      <rect x="186" y="48" width="8" height="88" rx="4" fill="${t.accent}" opacity="0.85"/>
      <circle cx="230" cy="90" r="28" fill="none" stroke="${t.orb}" stroke-width="3"/>
      <circle cx="230" cy="90" r="6" fill="${t.ink}"/>
    `,
    events: (t) => `
      <rect x="28" y="40" width="76" height="104" rx="12" fill="${t.ink}" opacity="0.08" stroke="${t.orb}" stroke-width="2"/>
      <rect x="116" y="40" width="76" height="104" rx="12" fill="${t.ink}" opacity="0.08" stroke="${t.ink}" stroke-width="2" opacity="0.4"/>
      <rect x="204" y="40" width="68" height="104" rx="12" fill="${t.accent}"/>
      <circle cx="66" cy="72" r="12" fill="${t.accent}"/>
      <circle cx="154" cy="72" r="12" fill="${t.orb}"/>
      <circle cx="238" cy="72" r="12" fill="#2a1018"/>
      <rect x="48" y="104" width="36" height="8" rx="4" fill="${t.ink}" opacity="0.25"/>
      <rect x="136" y="104" width="36" height="8" rx="4" fill="${t.ink}" opacity="0.25"/>
    `,
    certificate: (t) => `
      <rect x="62" y="24" width="176" height="132" rx="8" fill="${t.ink}" opacity="0.08" stroke="${t.accent}" stroke-width="2"/>
      <path d="M86 78 H214" stroke="${t.accent}" stroke-width="2"/>
      <rect x="104" y="48" width="92" height="12" rx="6" fill="${t.ink}" opacity="0.45"/>
      <rect x="118" y="94" width="64" height="8" rx="4" fill="${t.ink}" opacity="0.25"/>
      <circle cx="150" cy="128" r="14" fill="${t.accent}"/>
      <path d="M150 128 L146 154 L150 148 L154 154 Z" fill="${t.orb}"/>
    `,
    roster: (t) => `
      <rect x="28" y="32" width="244" height="116" rx="12" fill="${t.ink}" opacity="0.07" stroke="${t.orb}" stroke-width="2"/>
      <rect x="44" y="48" width="212" height="16" rx="8" fill="${t.accent}"/>
      <rect x="44" y="76" width="212" height="12" rx="6" fill="${t.ink}" opacity="0.2"/>
      <rect x="44" y="98" width="160" height="12" rx="6" fill="${t.ink}" opacity="0.15"/>
      <rect x="44" y="120" width="188" height="12" rx="6" fill="${t.orb}" opacity="0.55"/>
    `,
    transfer: (t) => `
      <circle cx="78" cy="90" r="36" fill="${t.ink}" opacity="0.08" stroke="${t.orb}" stroke-width="2"/>
      <circle cx="222" cy="90" r="36" fill="${t.accent}" opacity="0.9"/>
      <path d="M118 90 H182" stroke="${t.ink}" stroke-width="4"/>
      <polygon points="182,80 202,90 182,100" fill="${t.accent}"/>
      <circle cx="78" cy="90" r="10" fill="${t.orb}"/>
      <circle cx="222" cy="90" r="10" fill="#0e2a28"/>
    `,
    canvas: (t) => `
      <rect x="28" y="28" width="108" height="124" rx="12" fill="${t.ink}" opacity="0.08" stroke="${t.accent}" stroke-width="2"/>
      <rect x="152" y="28" width="120" height="56" rx="10" fill="${t.accent}"/>
      <rect x="152" y="96" width="120" height="56" rx="10" fill="${t.ink}" opacity="0.1" stroke="${t.orb}" stroke-width="2"/>
      <rect x="44" y="48" width="76" height="10" rx="5" fill="${t.ink}" opacity="0.35"/>
      <rect x="44" y="70" width="58" height="10" rx="5" fill="${t.ink}" opacity="0.2"/>
    `,
    mirror: (t) => `
      <rect x="32" y="34" width="108" height="112" rx="10" fill="${t.ink}" opacity="0.1" stroke="${t.orb}" stroke-width="2"/>
      <rect x="160" y="34" width="108" height="112" rx="10" fill="none" stroke="${t.accent}" stroke-width="2.5" stroke-dasharray="7 6"/>
      <path d="M140 90 H160" stroke="${t.ink}" stroke-width="3"/>
      <circle cx="86" cy="78" r="16" fill="${t.orb}" opacity="0.7"/>
      <circle cx="214" cy="78" r="16" fill="none" stroke="${t.accent}" stroke-width="2"/>
    `,
    catalog: (t) => `
      <rect x="24" y="44" width="78" height="100" rx="10" fill="${t.ink}" opacity="0.08" stroke="${t.orb}" stroke-width="2"/>
      <rect x="112" y="28" width="86" height="124" rx="12" fill="${t.accent}"/>
      <rect x="210" y="52" width="66" height="92" rx="10" fill="${t.ink}" opacity="0.1" stroke="${t.ink}" stroke-width="2"/>
      <rect x="128" y="48" width="54" height="10" rx="5" fill="#1c1810" opacity="0.45"/>
    `,
    sections: (t) => `
      <rect x="28" y="58" width="72" height="80" rx="10" fill="${t.ink}" opacity="0.1" stroke="${t.orb}" stroke-width="2"/>
      <rect x="114" y="28" width="72" height="124" rx="12" fill="${t.accent}"/>
      <rect x="200" y="70" width="72" height="68" rx="10" fill="${t.ink}" opacity="0.1" stroke="${t.ink}" stroke-width="2"/>
      <circle cx="150" cy="70" r="10" fill="#12182a"/>
    `,
    hubspot: (t) => `
      <circle cx="150" cy="90" r="34" fill="${t.accent}"/>
      <circle cx="58" cy="48" r="16" fill="${t.ink}" opacity="0.2"/>
      <circle cx="242" cy="48" r="16" fill="${t.ink}" opacity="0.2"/>
      <circle cx="58" cy="132" r="16" fill="${t.ink}" opacity="0.2"/>
      <circle cx="242" cy="132" r="16" fill="${t.ink}" opacity="0.2"/>
      <path d="M74 56 L122 78 M226 56 L178 78 M74 124 L122 102 M226 124 L178 102" stroke="${t.orb}" stroke-width="2.4"/>
    `,
    web: (t) => `
      <rect x="36" y="32" width="228" height="116" rx="12" fill="${t.ink}" opacity="0.08" stroke="${t.orb}" stroke-width="2"/>
      <rect x="36" y="32" width="228" height="28" rx="12" fill="${t.accent}"/>
      <circle cx="56" cy="46" r="5" fill="#071820"/>
      <circle cx="72" cy="46" r="5" fill="#071820" opacity="0.5"/>
      <rect x="56" y="78" width="96" height="12" rx="6" fill="${t.ink}" opacity="0.35"/>
      <rect x="56" y="102" width="148" height="10" rx="5" fill="${t.ink}" opacity="0.18"/>
    `,
    pipeline: (t) => `
      <rect x="22" y="70" width="64" height="48" rx="10" fill="${t.ink}" opacity="0.1" stroke="${t.orb}" stroke-width="2"/>
      <rect x="118" y="54" width="64" height="80" rx="10" fill="${t.ink}" opacity="0.1" stroke="${t.ink}" stroke-width="2"/>
      <rect x="214" y="36" width="64" height="108" rx="12" fill="${t.accent}"/>
      <path d="M86 94 H118 M182 94 H214" stroke="${t.orb}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="102" cy="94" r="5" fill="${t.ink}"/>
      <circle cx="198" cy="94" r="5" fill="${t.ink}"/>
    `,
    ai: (t) => `
      <circle cx="150" cy="90" r="52" fill="none" stroke="${t.orb}" stroke-width="1.5" opacity="0.4"/>
      <circle cx="150" cy="90" r="32" fill="${t.ink}" opacity="0.08" stroke="${t.accent}" stroke-width="2.5"/>
      <circle cx="150" cy="90" r="8" fill="${t.accent}"/>
      <path d="M150 28 V48 M150 132 V152 M78 90 H98 M202 90 H222 M96 44 L112 60 M204 44 L188 60 M96 136 L112 120 M204 136 L188 120" stroke="${t.orb}" stroke-width="2"/>
      <circle cx="78" cy="90" r="5" fill="${t.ink}"/>
      <circle cx="222" cy="90" r="5" fill="${t.ink}"/>
    `,
    resources: (t) => `
      <rect x="30" y="40" width="72" height="100" rx="10" fill="${t.ink}" opacity="0.08" stroke="${t.orb}" stroke-width="2"/>
      <rect x="114" y="40" width="72" height="100" rx="10" fill="${t.ink}" opacity="0.08" stroke="${t.ink}" stroke-width="2"/>
      <rect x="198" y="40" width="72" height="100" rx="10" fill="${t.accent}"/>
      <circle cx="66" cy="78" r="10" fill="${t.orb}"/>
      <circle cx="150" cy="78" r="10" fill="${t.ink}" opacity="0.3"/>
      <path d="M224 84 h20 a8 8 0 0 1 8 8 v16 h-36 z" fill="#0c2018"/>
    `,
    finance: (t) => `
      <path d="M36 128 L92 86 L148 102 L210 42 L268 58" fill="none" stroke="${t.accent}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="92" cy="86" r="7" fill="${t.orb}"/>
      <circle cx="148" cy="102" r="7" fill="${t.ink}"/>
      <circle cx="210" cy="42" r="8" fill="${t.accent}"/>
      <rect x="40" y="138" width="28" height="18" fill="${t.ink}" opacity="0.15"/>
      <rect x="78" y="126" width="28" height="30" fill="${t.ink}" opacity="0.2"/>
      <rect x="116" y="114" width="28" height="42" fill="${t.orb}" opacity="0.45"/>
    `,
    helpdesk: (t) => `
      <rect x="48" y="48" width="204" height="88" rx="44" fill="${t.ink}" opacity="0.08" stroke="${t.orb}" stroke-width="2"/>
      <circle cx="102" cy="92" r="22" fill="${t.accent}"/>
      <rect x="138" y="76" width="88" height="12" rx="6" fill="${t.ink}" opacity="0.4"/>
      <rect x="138" y="98" width="60" height="10" rx="5" fill="${t.ink}" opacity="0.2"/>
    `,
    analytics: (t) => `
      <rect x="40" y="108" width="32" height="40" rx="4" fill="${t.ink}" opacity="0.2"/>
      <rect x="86" y="84" width="32" height="64" rx="4" fill="${t.orb}" opacity="0.55"/>
      <rect x="132" y="48" width="32" height="100" rx="4" fill="${t.accent}"/>
      <rect x="178" y="68" width="32" height="80" rx="4" fill="${t.ink}" opacity="0.28"/>
      <rect x="224" y="36" width="32" height="112" rx="4" fill="${t.orb}"/>
    `,
    cleanup: (t) => `
      <rect x="28" y="48" width="108" height="84" rx="10" fill="${t.ink}" opacity="0.08" stroke="${t.ink}" stroke-width="2"/>
      <text x="42" y="98" fill="${t.ink}" opacity="0.55" font-size="13" font-family="monospace">a@b, c@d</text>
      <path d="M146 90 H168" stroke="${t.accent}" stroke-width="4"/>
      <polygon points="168,82 186,90 168,98" fill="${t.accent}"/>
      <rect x="194" y="40" width="80" height="36" rx="8" fill="${t.orb}" opacity="0.7"/>
      <rect x="194" y="92" width="80" height="36" rx="8" fill="${t.accent}"/>
    `,
    bike: (t) => `
      <circle cx="96" cy="108" r="32" fill="none" stroke="${t.ink}" stroke-width="5"/>
      <circle cx="214" cy="108" r="32" fill="none" stroke="${t.ink}" stroke-width="5"/>
      <path d="M96 108 L148 52 L196 108 L148 82 Z" fill="none" stroke="${t.accent}" stroke-width="5" stroke-linejoin="round"/>
      <circle cx="148" cy="52" r="8" fill="${t.accent}"/>
    `,
    ml: (t) => `
      <circle cx="70" cy="48" r="12" fill="${t.orb}"/>
      <circle cx="70" cy="132" r="12" fill="${t.orb}"/>
      <circle cx="150" cy="90" r="18" fill="${t.accent}"/>
      <circle cx="230" cy="48" r="12" fill="${t.ink}" opacity="0.45"/>
      <circle cx="230" cy="132" r="12" fill="${t.ink}" opacity="0.45"/>
      <path d="M82 54 L134 82 M82 126 L134 98 M166 82 L218 54 M166 98 L218 126" stroke="${t.ink}" stroke-width="2.4" opacity="0.7"/>
    `,
    game: (t) => `
      <rect x="78" y="44" width="144" height="96" rx="28" fill="${t.ink}" opacity="0.08" stroke="${t.accent}" stroke-width="3"/>
      <circle cx="124" cy="86" r="14" fill="${t.orb}"/>
      <circle cx="176" cy="86" r="14" fill="${t.accent}"/>
      <rect x="132" y="114" width="36" height="8" rx="4" fill="${t.ink}" opacity="0.35"/>
    `,
    address: (t) => `
      <path d="M92 36 C70 36 54 54 54 76 C54 108 92 148 92 148 C92 148 130 108 130 76 C130 54 114 36 92 36 Z" fill="${t.accent}"/>
      <circle cx="92" cy="74" r="12" fill="#102018"/>
      <rect x="156" y="48" width="116" height="14" rx="7" fill="${t.ink}" opacity="0.15"/>
      <rect x="156" y="76" width="96" height="14" rx="7" fill="${t.orb}" opacity="0.7"/>
      <rect x="156" y="104" width="108" height="14" rx="7" fill="${t.ink}" opacity="0.2"/>
    `,
    qrmail: (t) => `
      <rect x="36" y="48" width="140" height="92" rx="12" fill="${t.ink}" opacity="0.08" stroke="${t.orb}" stroke-width="2"/>
      <path d="M36 60 L106 108 L176 60" fill="none" stroke="${t.accent}" stroke-width="3"/>
      <rect x="196" y="44" width="72" height="72" rx="8" fill="${t.accent}"/>
      <rect x="210" y="58" width="18" height="18" fill="#180c14"/>
      <rect x="236" y="58" width="18" height="18" fill="#180c14" opacity="0.5"/>
      <rect x="210" y="84" width="18" height="18" fill="#180c14" opacity="0.5"/>
    `,
    webhook: (t) => `
      <path d="M132 24 L92 88 H140 L116 156 L196 76 H148 Z" fill="${t.accent}"/>
      <rect x="210" y="64" width="64" height="56" rx="10" fill="${t.ink}" opacity="0.1" stroke="${t.orb}" stroke-width="2"/>
      <path d="M188 90 H210" stroke="${t.orb}" stroke-width="3"/>
    `,
    groups: (t) => `
      <circle cx="118" cy="90" r="48" fill="${t.orb}" opacity="0.45"/>
      <circle cx="182" cy="90" r="48" fill="${t.accent}" opacity="0.55"/>
      <circle cx="150" cy="90" r="18" fill="${t.ink}" opacity="0.85"/>
    `,
    portal: (t) => `
      <path d="M86 152 V52 C86 36 150 20 150 20 C150 20 214 36 214 52 V152 Z" fill="${t.ink}" opacity="0.08" stroke="${t.accent}" stroke-width="3"/>
      <rect x="124" y="64" width="52" height="88" rx="6" fill="${t.accent}"/>
      <circle cx="164" cy="110" r="5" fill="#1c1408"/>
    `,
    redirect: (t) => `
      <path d="M36 90 H150" stroke="${t.orb}" stroke-width="5" stroke-linecap="round"/>
      <path d="M150 90 L230 44" stroke="${t.accent}" stroke-width="5" stroke-linecap="round"/>
      <path d="M150 90 L230 136" stroke="${t.ink}" stroke-width="5" stroke-linecap="round" opacity="0.35"/>
      <polygon points="230,36 250,44 230,54" fill="${t.accent}"/>
      <circle cx="150" cy="90" r="10" fill="${t.ink}"/>
    `,
    overlap: (t) => `
      <path d="M20 110 C70 40 110 40 150 110 C190 180 230 180 280 110" fill="none" stroke="${t.orb}" stroke-width="5"/>
      <path d="M20 90 C70 160 110 160 150 90 C190 20 230 20 280 90" fill="none" stroke="${t.accent}" stroke-width="5"/>
    `,
    learn: (t) => `
      <circle cx="60" cy="130" r="16" fill="${t.orb}"/>
      <circle cx="120" cy="88" r="16" fill="${t.ink}" opacity="0.25"/>
      <circle cx="180" cy="56" r="16" fill="${t.ink}" opacity="0.25"/>
      <circle cx="240" cy="40" r="20" fill="${t.accent}"/>
      <path d="M74 122 L106 98 M134 80 L166 62 M194 50 L222 44" stroke="${t.ink}" stroke-width="4" stroke-linecap="round"/>
    `,
    contacts: (t) => `
      <path d="M150 28 L214 52 V96 C214 128 150 154 150 154 C150 154 86 128 86 96 V52 Z" fill="${t.ink}" opacity="0.08" stroke="${t.accent}" stroke-width="3"/>
      <circle cx="150" cy="82" r="16" fill="${t.accent}"/>
      <path d="M126 118 C126 102 174 102 174 118" fill="${t.orb}"/>
    `
  };

  window.projectVisual = function projectVisual(kind) {
    try {
      const key = scenes[kind] ? kind : "web";
      const t = THEMES[key] || THEMES.web;
      const uid = `pv-${key}-${Math.random().toString(36).slice(2, 8)}`;
      const inner = scenes[key](t);
      return `<svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="${uid}-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${t.bg0}"/>
            <stop offset="100%" stop-color="${t.bg1}"/>
          </linearGradient>
          <radialGradient id="${uid}-orb" cx="82%" cy="12%" r="55%">
            <stop offset="0%" stop-color="${t.orb}" stop-opacity="0.55"/>
            <stop offset="100%" stop-color="${t.orb}" stop-opacity="0"/>
          </radialGradient>
          ${dots(uid, t.ink)}
        </defs>
        <rect width="300" height="180" fill="url(#${uid}-bg)"/>
        <rect width="300" height="180" fill="url(#${uid}-orb)"/>
        <rect width="300" height="180" fill="url(#${uid}-dots)"/>
        ${inner}
      </svg>`;
    } catch (err) {
      console.error("Project visual failed", { kind, message: err.message });
      return `<svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="300" height="180" fill="#0a323c"/></svg>`;
    }
  };

  function matchesFilter(project, filter) {
    if (filter === "all") return !project.archive;
    if (filter.startsWith("lang-")) {
      return !project.archive && (project.languages || []).includes(filter.slice(5));
    }
    if (filter.startsWith("concept-")) {
      return !project.archive && (project.concepts || []).includes(filter.slice(8));
    }
    if (filter === "personal") return project.category === "personal" || !!project.archive;
    return !project.archive && project.category === filter;
  }

  function renderPortfolio() {
    const grid = document.getElementById("project-grid");
    const filters = document.getElementById("filters");
    if (!grid || !window.PORTFOLIO) return;

    const data = window.PORTFOLIO;
    const modal = document.getElementById("project-modal");
    const modalVisual = document.getElementById("modal-visual");
    const modalTitle = document.getElementById("modal-title");
    const modalImpact = document.getElementById("modal-impact");
    const modalDetail = document.getElementById("modal-detail");
    const modalTools = document.getElementById("modal-tools");
    const modalLink = document.getElementById("modal-link");
    const modalClose = document.getElementById("modal-close");
    const countEl = document.getElementById("filter-count");

    if (filters && data.filterGroups) {
      function groupMarkup(group) {
        return `
          <div class="filter-group" data-filter-group="${group.id}">
            <p class="filter-group-label">${group.label}</p>
            <div class="filters">
              ${group.filters
                .map((c) => `<button type="button" class="filter-btn" data-filter="${c.id}">${c.label}</button>`)
                .join("")}
            </div>
          </div>`;
      }

      const primaryGroups = data.filterGroups.filter((g) => g.id === "domain");
      const moreGroups = data.filterGroups.filter((g) => g.id !== "domain");

      filters.innerHTML = `
        <div class="filter-group">
          <p class="filter-group-label">View</p>
          <div class="filters">
            <button type="button" class="filter-btn is-active" data-filter="all">All</button>
          </div>
        </div>
        ${primaryGroups.map(groupMarkup).join("")}
        <button type="button" class="filter-more-btn" aria-expanded="false" aria-controls="filter-more">
          More filters
        </button>
        <div id="filter-more" class="filter-more">
          ${moreGroups.map(groupMarkup).join("")}
        </div>`;

      const moreBtn = filters.querySelector(".filter-more-btn");
      const morePanel = filters.querySelector("#filter-more");
      if (moreBtn && morePanel) {
        const mobileMq = window.matchMedia("(max-width: 720px)");

        function syncFilterMore() {
          const mobile = mobileMq.matches;
          const open = filters.classList.contains("is-expanded");
          moreBtn.hidden = !mobile;
          if (!mobile) {
            morePanel.hidden = false;
            moreBtn.setAttribute("aria-expanded", "false");
            return;
          }
          morePanel.hidden = !open;
          moreBtn.setAttribute("aria-expanded", String(open));
          moreBtn.textContent = open ? "Fewer filters" : "More filters";
        }

        moreBtn.addEventListener("click", () => {
          filters.classList.toggle("is-expanded");
          syncFilterMore();
        });

        if (typeof mobileMq.addEventListener === "function") {
          mobileMq.addEventListener("change", syncFilterMore);
        } else if (typeof mobileMq.addListener === "function") {
          mobileMq.addListener(syncFilterMore);
        }
        syncFilterMore();
      }
    }

    function getFocusable(container) {
      return [...container.querySelectorAll(
        'a[href]:not([hidden]), button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )].filter((el) => el.getAttribute("aria-hidden") !== "true" && !el.hasAttribute("hidden"));
    }

    let modalTrigger = null;

    function setPageInert(inert) {
      document.querySelectorAll("header.site-header, main, footer.site-footer").forEach((el) => {
        if (inert) el.setAttribute("inert", "");
        else el.removeAttribute("inert");
      });
    }

    function openModal(project, trigger) {
      if (!modal) return;
      modalTrigger = trigger || document.activeElement;
      modalVisual.innerHTML = projectVisual(project.visual);
      modalTitle.textContent = project.title;
      modalImpact.textContent = project.impact;
      modalDetail.textContent = project.detail;
      modalTools.innerHTML = project.tools.map((tool) => `<span class="chip">${tool}</span>`).join("");
      if (project.link) {
        modalLink.href = project.link;
        modalLink.hidden = false;
      } else {
        modalLink.hidden = true;
      }
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      setPageInert(true);
      requestAnimationFrame(() => {
        if (modalClose) modalClose.focus();
      });
    }

    function closeModal() {
      if (!modal || !modal.classList.contains("is-open")) return;
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      setPageInert(false);
      if (modalTrigger && typeof modalTrigger.focus === "function") {
        modalTrigger.focus();
      }
      modalTrigger = null;
    }

    if (modalClose) modalClose.addEventListener("click", closeModal);
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      });
      document.addEventListener("keydown", (e) => {
        if (!modal.classList.contains("is-open")) return;
        if (e.key === "Escape") {
          e.preventDefault();
          closeModal();
          return;
        }
        if (e.key !== "Tab") return;
        const focusable = getFocusable(modal);
        if (!focusable.length) {
          e.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      });
    }

    function paint(filter) {
      const list = data.projects
        .filter((p) => matchesFilter(p, filter))
        .sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
      if (countEl) {
        countEl.textContent = `${list.length} project${list.length === 1 ? "" : "s"}`;
      }
      if (!list.length) {
        grid.innerHTML = `<p class="filter-empty">No projects in this group yet.</p>`;
        return;
      }
      const labels = data.domainLabels || {};
      grid.innerHTML = list
        .map(
          (p, idx) => `
        <button type="button" class="project-card" data-id="${p.id}" style="transition-delay:${Math.min(idx, 8) * 40}ms">
          <div class="card-visual">${projectVisual(p.visual)}</div>
          <div class="card-body">
            <div class="card-meta">
              <span>${labels[p.category] || p.category}</span>
              <span class="card-status">${p.status}</span>
            </div>
            <h3 class="card-title">${p.title}</h3>
            <p class="card-summary">${p.summary}</p>
            <div class="card-tools">${p.tools
              .slice(0, 3)
              .map((tool) => `<span class="chip">${tool}</span>`)
              .join("")}</div>
          </div>
        </button>`
        )
        .join("");

      requestAnimationFrame(() => {
        grid.querySelectorAll(".project-card").forEach((card) => card.classList.add("is-visible"));
      });

      grid.querySelectorAll(".project-card").forEach((card) => {
        card.addEventListener("click", () => {
          const project = data.projects.find((p) => p.id === card.dataset.id);
          if (project) openModal(project, card);
        });
      });
    }

    if (filters) {
      filters.addEventListener("click", (e) => {
        const btn = e.target.closest(".filter-btn");
        if (!btn) return;
        filters.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        paint(btn.dataset.filter);
      });
    }

    const hash = window.location.hash.replace("#", "");
    const fromHash = hash && data.projects.find((p) => p.id === hash);
    paint("all");
    if (fromHash) openModal(fromHash);
  }

  function renderFeatured() {
    const row = document.getElementById("featured-row");
    if (!row || !window.PORTFOLIO) return;
    const featured = window.PORTFOLIO.projects.filter((p) => p.featured).slice(0, 3);
    row.innerHTML = featured
      .map(
        (p) => `
      <a class="feature-tile" href="portfolio.html#${p.id}">
        <div class="card-visual">${projectVisual(p.visual)}</div>
        <div class="tile-content">
          <h3>${p.title}</h3>
          <p>${p.impact || p.summary}</p>
        </div>
      </a>`
      )
      .join("");
  }

  (function initPortfolioIntro() {
    const root = document.querySelector(".portfolio-intro");
    const sceneEl = document.getElementById("portfolio-nexus-scene");
    if (!root || !sceneEl) return;
    let unbindStage = () => {};
    const quality = sceneQuality();
    injectScene(sceneEl, buildNexusScene(quality), quality, () => {
      unbindStage();
      unbindStage = bindPortfolioScrollStage(root, sceneEl);
    });
  })();

  (function initShareSite() {
    const buttons = document.querySelectorAll("[data-share-site]");
    if (!buttons.length) return;

    const LABEL = "Share this site";
    const COPIED = "Link copied";
    let resetTimer = 0;

    function shareUrl() {
      try {
        return new URL("index.html", location.href).href;
      } catch (err) {
        console.warn("Could not build share URL", err);
        return location.href;
      }
    }

    function shareTitle() {
      const og = document.querySelector('meta[property="og:title"]');
      const content = og && og.getAttribute("content");
      return (content && content.trim()) || "Diego Martinez";
    }

    function shareText() {
      const og = document.querySelector('meta[property="og:description"]');
      const content = og && og.getAttribute("content");
      return (content && content.trim()) || "Portfolio — ops software, automation, integrations.";
    }

    function setFeedback(btn, message) {
      btn.textContent = message;
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        buttons.forEach((el) => {
          el.textContent = LABEL;
        });
      }, 2000);
    }

    async function copyLink(url) {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(url);
        return;
      }
      const input = document.createElement("input");
      input.value = url;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      const ok = document.execCommand("copy");
      input.remove();
      if (!ok) throw new Error("Clipboard copy failed");
    }

    async function onShare(btn) {
      const url = shareUrl();
      const payload = { title: shareTitle(), text: shareText(), url };

      try {
        if (typeof navigator.share === "function") {
          await navigator.share(payload);
          return;
        }
        await copyLink(url);
        setFeedback(btn, COPIED);
      } catch (err) {
        if (err && err.name === "AbortError") return;
        try {
          await copyLink(url);
          setFeedback(btn, COPIED);
        } catch (copyErr) {
          console.error("Share failed", {
            message: copyErr && copyErr.message,
            url
          });
          setFeedback(btn, "Copy failed");
        }
      }
    }

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        onShare(btn).catch((err) => {
          console.error("Share handler error", { message: err && err.message });
        });
      });
    });
  })();

  try {
    renderFeatured();
    renderPortfolio();
  } catch (err) {
    console.error("Portfolio render failed", { message: err.message });
  }
})();
