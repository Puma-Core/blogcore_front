import "./styles.css";

const API_ORIGIN = "https://admin-blog.pumacore.com";
const ABOUT_URL = "https://raw.githubusercontent.com/Puma-Core/BlogCore/refs/heads/main/ABOUT.md";
const LOGO_URL = "https://public-bucket.pumacore.com/blogcore/public/logo.png";
const PUMACORE_LOGO_URL = "https://avatars.githubusercontent.com/u/204806552?s=400&u=3514eee1d3d82f6704cddf7ab623cab65fcefa27&v=4";
const WELCOME_GIF_URL = "https://public-bucket.pumacore.com/blogcore/public/9427edffd50c4f89b96adf70843ba113.gif";
const WELCOME_LOGO_APPEAR_AT_MS = 3850;
const WELCOME_GIF_FADE_START_AT_MS = 3900;
const WELCOME_GIF_FADE_DURATION_MS = 120;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const appUrl = (path) => `${basePath}${path}`;
// Request paths already include /api, so the default is only the deployment base path.
const apiBase = (import.meta.env.VITE_API_BASE_URL || basePath).replace(/\/$/, "");
const app = document.querySelector("#app");
const storageKey = "blogcore:recent-authors";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

function initials(name) {
  return String(name || "?").split(" ").filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

function formatDate(value, options = { year: "numeric", month: "long" }) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-US", options);
}

async function getJson(path) {
  const response = await fetch(`${apiBase}${path}`, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(response.status === 404 ? "not_found" : "unavailable");
  return response.json();
}

function getRecentSearches() {
  try {
    const items = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return Array.isArray(items) ? items.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function addRecentSearch(username) {
  const value = username.trim();
  if (!value) return;
  localStorage.setItem(storageKey, JSON.stringify([value, ...getRecentSearches().filter((item) => item !== value)].slice(0, 8)));
}

function navigate(path) {
  history.pushState({}, "", appUrl(path));
  renderRoute();
}

function header() {
  const pathname = window.location.pathname;
  const route = pathname.startsWith(basePath) ? pathname.slice(basePath.length) || "/" : pathname;
  return `<header class="site-header"><div class="header-content"><a class="brand" href="${appUrl("/")}"><img src="${LOGO_URL}" alt="BlogCore" /><span>BlogCore</span></a><nav class="navigation" aria-label="Main navigation"><a href="${appUrl("/")}"${route === "/" ? ' aria-current="page"' : ""}>Authors</a><a href="${appUrl("/about")}"${route === "/about" ? ' aria-current="page"' : ""}>About</a></nav></div><hr /></header>`;
}

function footer() {
  return `<footer class="site-footer"><span>BlogCore</span><span>Powered by PumaCore</span><img src="${PUMACORE_LOGO_URL}" alt="PumaCore" /></footer>`;
}

function setPage(title, content) {
  document.title = title;
  app.innerHTML = `${header()}${content}${footer()}`;
}

function notice(title, message, link = "/", linkText = "Go home") {
  return `<main><section class="notice"><h1>${escapeHtml(title)}</h1><p class="muted">${escapeHtml(message)}</p><a class="button" href="${appUrl(link)}">${escapeHtml(linkText)}</a></section></main>`;
}

function authorAvatar(author, className = "avatar") {
  const name = author.fullname || `${author.first_name || ""} ${author.last_name || ""}`.trim();
  return author.photo_url
    ? `<img class="${className}" src="${escapeAttribute(author.photo_url)}" alt="${escapeAttribute(name)}" loading="lazy" />`
    : `<span class="${className}" aria-label="${escapeAttribute(name)}">${escapeHtml(initials(name))}</span>`;
}

function socialLinks(networks) {
  let value = networks;
  if (typeof value === "string") {
    try { value = JSON.parse(value); } catch { value = { Website: value }; }
  }
  const entries = Array.isArray(value)
    ? value.map((item) => {
        if (typeof item === "string") return ["Website", item];
        return [item?.name || item?.platform || "Website", item?.url || item?.link || item?.value];
      })
    : Object.entries(value || {});
  const links = entries.filter(([, url]) => typeof url === "string" && /^https?:\/\//i.test(url));
  if (!links.length) return "";
  return `<ul class="social-links" aria-label="Social networks">${links.map(([name, url]) => `<li><a href="${escapeAttribute(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(name)}</a></li>`).join("")}</ul>`;
}

function renderHome() {
  setPage("BlogCore - Find an author and read their posts", `<main class="home"><div id="welcome-animation" class="welcome-animation"><img class="welcome-logo" src="${LOGO_URL}" alt="BlogCore" /><img class="welcome-gif" src="${WELCOME_GIF_URL}" alt="BlogCore animation" /></div><h1>Read what authors publish.</h1><p class="lede">Type an author's public username to open their profile and browse every post they have written.</p><form class="search-form" id="author-search"><div class="search-box"><input id="username" type="text" placeholder="Author username, e.g. jane-doe" aria-label="Author username" autocomplete="off" /><ul id="suggestions" class="suggestions" hidden></ul></div><button type="submit">Search</button></form></main>`);
  const animation = document.querySelector("#welcome-animation");
  const logo = animation.querySelector(".welcome-logo");
  const gif = animation.querySelector(".welcome-gif");
  const completeWelcomeAnimation = () => {
    window.setTimeout(() => {
      if (animation.isConnected) logo.classList.add("is-visible");
    }, WELCOME_LOGO_APPEAR_AT_MS);
    window.setTimeout(() => {
      if (animation.isConnected) gif.classList.add("is-fading");
      window.setTimeout(() => gif.remove(), WELCOME_GIF_FADE_DURATION_MS);
    }, WELCOME_GIF_FADE_START_AT_MS);
  };
  if (gif.complete) completeWelcomeAnimation();
  else gif.addEventListener("load", completeWelcomeAnimation, { once: true });
  const form = document.querySelector("#author-search");
  const input = document.querySelector("#username");
  const suggestions = document.querySelector("#suggestions");
  const updateSuggestions = () => {
    const query = input.value.trim().toLowerCase();
    const matches = getRecentSearches().filter((item) => item.toLowerCase().includes(query));
    suggestions.hidden = matches.length === 0;
    suggestions.innerHTML = matches.map((item) => `<li><button type="button" data-username="${escapeAttribute(item)}">/${escapeHtml(item)}</button></li>`).join("");
  };
  input.addEventListener("input", updateSuggestions);
  input.addEventListener("focus", updateSuggestions);
  suggestions.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-username]");
    if (button) navigate(`/authors/${encodeURIComponent(button.dataset.username)}`);
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (input.value.trim()) navigate(`/authors/${encodeURIComponent(input.value.trim())}`);
  });
}

async function renderAuthor(username) {
  setPage("Author - BlogCore", `<main><p class="muted">Loading author...</p></main>`);
  try {
    const [author, initialPosts] = await Promise.all([
      getJson(`/api/authors/${encodeURIComponent(username)}/`),
      getJson(`/api/authors/${encodeURIComponent(username)}/posts/`),
    ]);
    addRecentSearch(author.public_username || username);
    let posts = initialPosts.results || [];
    let next = initialPosts.next;
    const renderPosts = () => {
      const label = `${String(posts.length).padStart(2, "0")} ${posts.length === 1 ? "article" : "articles"}`;
      return `<section><div class="posts-heading"><h2>Posts</h2><span class="username">[ ${label} ]</span></div>${posts.length ? `<ul class="post-list">${posts.map((post) => `<li><a href="${appUrl(`/authors/${encodeURIComponent(username)}/${encodeURIComponent(post.unique_name)}`)}"><span class="post-date">${escapeHtml(formatDate(post.created_at))}</span><h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.content_preview)}</p></a></li>`).join("")}</ul>` : '<p class="muted">Content not found.</p>'}${next ? '<button class="load-more" id="load-more" type="button">Load more +</button>' : ""}</section>`;
    };
    const authorTitle = author.title || author.fullname;
    setPage(`${author.fullname || username} - BlogCore`, `<main><section><div class="profile">${authorAvatar(author)}<div><span class="section-label">Profile</span><div class="username">/${escapeHtml(author.public_username || username)}</div><div class="profile-name">${escapeHtml(author.fullname)}</div></div></div><h1>${escapeHtml(authorTitle)}</h1><p class="lede">${escapeHtml(author.short_description || author.subtitle || "")}</p>${socialLinks(author.social_networks)}${author.subtitle ? `<p class="username">${escapeHtml(author.subtitle)}</p>` : ""}</section><hr class="divider" /><div id="posts">${renderPosts()}</div></main>`);
    document.querySelector("#posts").addEventListener("click", async (event) => {
      const button = event.target.closest("#load-more");
      if (!button || !next) return;
      button.disabled = true;
      button.textContent = "Loading...";
      try {
        const pageUrl = new URL(next, API_ORIGIN);
        const page = pageUrl.searchParams.get("page");
        const result = await getJson(`/api/authors/${encodeURIComponent(username)}/posts/${page ? `?page=${encodeURIComponent(page)}` : ""}`);
        posts = [...posts, ...(result.results || [])];
        next = result.next;
        document.querySelector("#posts").innerHTML = renderPosts();
      } catch {
        button.textContent = "Try again";
        button.disabled = false;
      }
    });
  } catch (error) {
    const missing = error.message === "not_found";
    setPage("Author - BlogCore", notice(missing ? "Author not found" : "Service unavailable", missing ? `No author matches the username "${username}".` : "We could not reach the blog service. Please try again later.", "/", "Search another author"));
  }
}

function renderMarkdown(markdown) {
  const inline = (text) => escapeHtml(text)
    .replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />')
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  const lines = String(markdown || "").split("\n");
  const output = [];
  let inCode = false;
  for (const line of lines) {
    if (line.startsWith("```")) { output.push(inCode ? "</code></pre>" : "<pre><code>"); inCode = !inCode; continue; }
    if (inCode) { output.push(`${escapeHtml(line)}\n`); continue; }
    if (/^#{1,6} /.test(line)) { const level = line.match(/^#+/)[0].length; output.push(`<h${level}>${inline(line.slice(level + 1))}</h${level}>`); }
    else if (/^> /.test(line)) output.push(`<blockquote>${inline(line.slice(2))}</blockquote>`);
    else if (/^---+$/.test(line)) output.push("<hr />");
    else if (line.trim()) output.push(`<p>${inline(line)}</p>`);
  }
  return output.join("");
}

async function renderPost(username, uniqueName) {
  setPage("Post - BlogCore", `<main><p class="muted">Loading post...</p></main>`);
  try {
    const [post, author] = await Promise.all([getJson(`/api/authors/${encodeURIComponent(username)}/posts/${encodeURIComponent(uniqueName)}/`), getJson(`/api/authors/${encodeURIComponent(username)}/`).catch(() => null)]);
    const displayAuthor = author || { fullname: post.author_full_name };
    setPage(`${post.title} - BlogCore`, `<main><article class="article"><a class="back-link" href="${appUrl(`/authors/${encodeURIComponent(username)}`)}">&larr; ${escapeHtml(post.author_full_name)}</a><h1>${escapeHtml(post.title)}</h1><p class="muted">By ${escapeHtml(post.author_full_name)} · ${escapeHtml(formatDate(post.created_at, { year: "numeric", month: "long", day: "numeric" }))}</p><div class="article-content">${renderMarkdown(post.content)}</div><a class="author-footer" href="${appUrl(`/authors/${encodeURIComponent(username)}`)}">${authorAvatar(displayAuthor)}<span><span class="section-label">Posted by</span><strong>${escapeHtml(post.author_full_name)}</strong><span class="username">/${escapeHtml(post.public_username)} · ${escapeHtml(formatDate(post.created_at, { year: "numeric", month: "long", day: "numeric" }))}</span></span></a></article></main>`);
  } catch (error) {
    const missing = error.message === "not_found";
    setPage("Post - BlogCore", notice(missing ? "Content not found" : "Service unavailable", missing ? "This post does not exist or is no longer published." : "We could not reach the blog service. Please try again later.", `/authors/${encodeURIComponent(username)}`, "Back to the author"));
  }
}

async function renderAbout() {
  setPage("About - BlogCore", `<main><p class="muted">Loading...</p></main>`);
  try {
    const response = await fetch(ABOUT_URL);
    if (!response.ok) throw new Error("unavailable");
    setPage("About - BlogCore", `<main><article class="article"><h1>About</h1><div class="article-content">${renderMarkdown(await response.text())}</div></article></main>`);
  } catch {
    setPage("About - BlogCore", notice("Service unavailable", "Could not load the About content. Please try again later."));
  }
}

function renderRoute() {
  const pathname = window.location.pathname.startsWith(basePath)
    ? window.location.pathname.slice(basePath.length)
    : window.location.pathname;
  const path = pathname.replace(/\/$/, "") || "/";
  const authorMatch = path.match(/^\/authors\/([^/]+)$/);
  const postMatch = path.match(/^\/authors\/([^/]+)\/([^/]+)$/);
  if (path === "/") renderHome();
  else if (path === "/about") renderAbout();
  else if (postMatch) renderPost(decodeURIComponent(postMatch[1]), decodeURIComponent(postMatch[2]));
  else if (authorMatch) renderAuthor(decodeURIComponent(authorMatch[1]));
  else setPage("Page not found - BlogCore", notice("Page not found", "The page you're looking for doesn't exist or has been moved."));
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (!link || link.target || event.metaKey || event.ctrlKey || event.shiftKey || link.origin !== window.location.origin) return;
  event.preventDefault();
  const path = link.pathname.startsWith(basePath) ? link.pathname.slice(basePath.length) || "/" : link.pathname;
  navigate(path);
});
window.addEventListener("popstate", renderRoute);
try {
  renderRoute();
} catch (error) {
  console.error(error);
  setPage("BlogCore", notice("This page didn't load", "Please refresh the page and try again."));
}
