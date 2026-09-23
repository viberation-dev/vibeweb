/* Shared behaviour for both reading prototypes. No dependencies. */
(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];

  /* ---- theme ---- */
  const root = document.documentElement;
  const themeBtn = $("#theme");
  if (themeBtn) {
    const icon = () => {
      themeBtn.innerHTML =
        root.dataset.theme === "dark"
          ? '<i class="ti ti-sun"></i>'
          : '<i class="ti ti-moon"></i>';
    };
    icon();
    themeBtn.onclick = () => {
      root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
      icon();
    };
  }

  /* ---- text size ---- */
  $$(".ctl button").forEach((b) => {
    b.onclick = () => {
      $$(".ctl button").forEach((x) => x.setAttribute("aria-pressed", "false"));
      b.setAttribute("aria-pressed", "true");
      root.style.setProperty("--font-body", b.dataset.f);
      root.style.setProperty("--lh", b.dataset.lh);
    };
  });

  /* ---- reading time, from the real body copy ---- */
  const article = $("#article");
  const WPM = 210;
  let minutes = 8;
  if (article) {
    const words = article.innerText.trim().split(/\s+/).length;
    minutes = Math.max(1, Math.round(words / WPM));
    $$("#rt, .rt").forEach((el) => (el.textContent = minutes + " min read"));
  }

  /* ---- likes ---- */
  let likes = 248,
    liked = false;
  const paintLikes = () => {
    $$(".likes-n, #likes-meta").forEach((el) => (el.textContent = likes));
    $$(".like-toggle").forEach((el) =>
      el.setAttribute("aria-pressed", String(liked)),
    );
    const label = $(".like-label");
    if (label) label.textContent = liked ? "Thanks!" : "Appreciate this guide";
  };
  $$(".like-toggle").forEach((el) => {
    el.onclick = () => {
      liked = !liked;
      likes += liked ? 1 : -1;
      paintLikes();
    };
  });
  paintLikes();

  /* ---- share ---- */
  const SHARE = {
    x: (u, t) => `https://x.com/intent/post?url=${u}&text=${t}`,
    facebook: (u) => `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    linkedin: (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    threads: (u, t) => `https://www.threads.net/intent/post?url=${u}&text=${t}`,
    pinterest: (u, t) =>
      `https://pinterest.com/pin/create/button/?url=${u}&description=${t}`,
  };
  $$("[data-share]").forEach((btn) => {
    btn.onclick = () => {
      const kind = btn.dataset.share;
      const u = encodeURIComponent(location.href);
      const t = encodeURIComponent(document.title);
      if (kind === "copy" || kind === "instagram") {
        // Instagram has no web share intent — copying the link is the honest fallback.
        navigator.clipboard?.writeText(location.href);
        const old = btn.innerHTML;
        btn.innerHTML = '<i class="ti ti-check"></i> Copied';
        setTimeout(() => (btn.innerHTML = old), 1400);
        return;
      }
      if (SHARE[kind]) window.open(SHARE[kind](u, t), "_blank", "noopener");
    };
  });

  /* ---- TOC built from the article's own headings ---- */
  const nav = $("#tocnav");
  let links = [];
  if (nav && article) {
    const heads = $$("h2[id], h3[id]", article);
    nav.innerHTML = heads
      .map((h) => {
        const num = $(".num", h);
        const text = num ? h.textContent.replace(num.textContent, "") : h.textContent;
        return `<a href="#${h.id}" class="${h.tagName === "H3" ? "sub" : ""}">${text.trim()}</a>`;
      })
      .join("");
    const c = $("#comments");
    if (c) nav.innerHTML += '<a href="#comments">Comments</a>';
    links = $$("a", nav);

    const targets = links
      .map((a) => $(a.getAttribute("href")))
      .filter(Boolean);
    const seen = new Set();
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) =>
          e.isIntersecting ? seen.add(e.target.id) : seen.delete(e.target.id),
        );
        const first = targets.find((t) => seen.has(t.id));
        links.forEach((a) =>
          a.classList.toggle(
            "active",
            !!first && a.getAttribute("href") === "#" + first.id,
          ),
        );
      },
      { rootMargin: "-88px 0px -55% 0px" },
    );
    targets.forEach((t) => obs.observe(t));
  }

  /* ---- progress, % read, back to top ---- */
  const bar = $("#progress");
  const toTop = $("#toTop");
  const pct = $("#pct");
  const left = $("#left");
  const onScroll = () => {
    const d = document.documentElement;
    const p = d.scrollTop / Math.max(1, d.scrollHeight - d.clientHeight);
    if (bar) bar.style.width = p * 100 + "%";
    if (pct) pct.textContent = Math.round(p * 100);
    if (left) left.textContent = Math.max(0, Math.round(minutes * (1 - p))) + " min";
    if (toTop) toTop.classList.toggle("show", d.scrollTop > 700);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop)
    toTop.onclick = () =>
      scrollTo({
        top: 0,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });

  /* ---- comments (demo only — no persistence) ---- */
  const list = $("#clist");
  const countComments = () => {
    // Top-level only — a nested reply is not a separate comment.
    const n = $$(":scope > .citem", list).length;
    $$(".ccount, #ccount-meta").forEach((el) => (el.textContent = n));
  };
  const wireComment = (el) => {
    $$(".clike", el).forEach((b) => {
      b.onclick = () => {
        const on = b.getAttribute("aria-pressed") === "true";
        b.setAttribute("aria-pressed", String(!on));
        const n = parseInt(b.textContent.trim() || "0", 10) || 0;
        b.innerHTML = `<i class="ti ti-heart"></i> ${on ? n - 1 : n + 1}`;
      };
    });
    $$(".creply", el).forEach((b) => {
      b.onclick = () => {
        $("#ctext")?.focus();
        $("#ctext").value = "@" + $("b", el).textContent + " ";
      };
    });
  };
  if (list) {
    $$(".citem", list).forEach(wireComment);
    countComments();
    const post = $("#cpost");
    if (post)
      post.onclick = () => {
        const text = $("#ctext").value.trim();
        if (!text) return $("#ctext").focus();
        const name = $("#cname").value.trim() || "Guest";
        const el = document.createElement("div");
        el.className = "citem";
        el.innerHTML =
          '<div class="avatar"></div><div><b></b><time>Just now</time><p></p>' +
          '<div class="cact"><button class="clike" aria-pressed="false"><i class="ti ti-heart"></i> 0</button>' +
          '<button class="creply">Reply</button></div></div>';
        $(".avatar", el).textContent = name[0].toUpperCase();
        $("b", el).textContent = name;
        $("p", el).textContent = text;
        list.prepend(el);
        wireComment(el);
        countComments();
        $("#ctext").value = "";
      };
  }

  /* ---- copy buttons in code blocks ---- */
  $$("[data-copy]").forEach((b) => {
    b.onclick = () => {
      const pre = b.closest(".codeblk")?.querySelector("code");
      navigator.clipboard?.writeText(pre?.textContent || "");
      const old = b.innerHTML;
      b.innerHTML = '<i class="ti ti-check"></i> Copied';
      setTimeout(() => (b.innerHTML = old), 1400);
    };
  });

  /* ---- view counter, demo ---- */
  const views = $("#views");
  if (views)
    views.textContent = (
      parseInt(views.textContent.replace(/\D/g, ""), 10) + 1
    ).toLocaleString();
})();
