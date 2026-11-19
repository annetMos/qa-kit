/**
 * Mini RealWorld (Conduit)-style app for demos and CI.
 * Only what the examples need: login, article CRUD, article page, editor.
 * Data is kept in memory and reset on restart.
 *
 * Run: npm run demo  →  http://localhost:4555
 */
import { createServer } from 'node:http';

const PORT = Number(process.env.DEMO_PORT ?? 4555);
const DEMO_USER = { email: 'qa@example.com', password: 'qa-password', username: 'qa' };
const TOKEN = 'demo-jwt-token';
const SESSION_ID = 'demo-session-id';

/** @type {Map<string, {slug: string, title: string, description: string, body: string, tagList: string[], createdAt: string}>} */
const articles = new Map();

const escapeHtml = (text) =>
  String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const slugify = (title) =>
  `${title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '')}-${Math.random().toString(36).slice(2, 8)}`;

const sendJson = (res, status, body) => {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
};

/**
 * Client script: like the Conduit frontend, the token is kept in localStorage (jwtToken).
 * The header shows the current user; the editor works only for a logged-in user
 * (token in localStorage or session cookie — cookies are sent by the browser automatically).
 */
const CLIENT_SCRIPT = `
const token = localStorage.getItem('jwtToken');
const api = (path, options = {}) => fetch('/api/' + path, {
  ...options,
  headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Token ' + token } : {}) },
});
const currentUser = api('user').then((res) => (res.ok ? res.json().then((body) => body.user) : null));
async function renderNav() {
  const slot = document.getElementById('nav-user');
  const user = await currentUser;
  if (!user) { slot.innerHTML = '<a href="/login">Sign in</a>'; return; }
  slot.innerHTML = '<a href="/editor">New Article</a> <span data-testid="current-user"></span>';
  slot.querySelector('[data-testid=current-user]').textContent = user.username;
}
async function renderEditor() {
  const root = document.getElementById('editor');
  if (!root) return;
  if (!(await currentUser)) { root.innerHTML = '<p>To write an article, <a href="/login">Sign in</a></p>'; return; }
  root.innerHTML = '<form>'
    + '<input name="title" placeholder="Article Title">'
    + '<input name="description" placeholder="What\\'s this article about?">'
    + '<textarea name="body" placeholder="Write your article (in markdown)"></textarea>'
    + '<button type="submit">Publish Article</button></form>';
  root.querySelector('form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    const res = await api('articles', { method: 'POST', body: JSON.stringify({ article: data }) });
    if (res.ok) {
      const { article } = await res.json();
      location.href = '/article/' + encodeURIComponent(article.slug);
    }
  });
}
renderNav();
renderEditor();
`;

const sendHtml = (res, status, title, content) => {
  res.writeHead(status, { 'content-type': 'text/html; charset=utf-8' });
  res.end(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
<body><nav><a href="/">conduit</a> <span id="nav-user"></span></nav><main>${content}</main>
<script>${CLIENT_SCRIPT}</script></body></html>`);
};

const readCookie = (req, name) =>
  (req.headers.cookie ?? '')
    .split(';')
    .map((part) => part.trim().split('='))
    .find(([key]) => key === name)?.[1];

/** Two ways to log in, like real apps: a token header (Conduit style) or a session cookie. */
const isAuthorized = (req) =>
  req.headers.authorization === `Token ${TOKEN}` || readCookie(req, 'sid') === SESSION_ID;

const readJson = async (req) => {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return undefined;
  }
};

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  const path = decodeURIComponent(url.pathname);
  const body = await readJson(req);
  if (body === undefined) return sendJson(res, 400, { errors: { body: ['invalid JSON'] } });

  // --- API ---
  if (req.method === 'POST' && path === '/api/users/login') {
    const { email, password } = body.user ?? {};
    if (email !== DEMO_USER.email || password !== DEMO_USER.password) {
      return sendJson(res, 401, { errors: { credentials: ['invalid'] } });
    }
    return sendJson(res, 200, { user: { email, username: DEMO_USER.username, token: TOKEN } });
  }

  if (req.method === 'POST' && path === '/api/session') {
    const { email, password } = body;
    if (email !== DEMO_USER.email || password !== DEMO_USER.password) {
      return sendJson(res, 401, { errors: { credentials: ['invalid'] } });
    }
    res.writeHead(204, { 'set-cookie': `sid=${SESSION_ID}; HttpOnly; Path=/; SameSite=Lax` });
    return res.end();
  }

  if (req.method === 'GET' && path === '/api/user') {
    if (!isAuthorized(req)) return sendJson(res, 401, { errors: { auth: ['unauthorized'] } });
    return sendJson(res, 200, { user: { email: DEMO_USER.email, username: DEMO_USER.username, token: TOKEN } });
  }

  if (req.method === 'POST' && path === '/api/articles') {
    if (!isAuthorized(req)) return sendJson(res, 401, { errors: { auth: ['unauthorized'] } });
    const { title, description, body: text, tagList = [] } = body.article ?? {};
    if (!title || !description || !text) {
      return sendJson(res, 422, { errors: { article: ['title, description and body are required'] } });
    }
    const article = { slug: slugify(title), title, description, body: text, tagList, createdAt: new Date().toISOString() };
    articles.set(article.slug, article);
    return sendJson(res, 201, { article });
  }

  const apiArticle = path.match(/^\/api\/articles\/([^/]+)$/);
  if (apiArticle) {
    const article = articles.get(apiArticle[1]);
    if (!article) return sendJson(res, 404, { errors: { article: ['not found'] } });
    if (req.method === 'GET') return sendJson(res, 200, { article });
    if (req.method === 'DELETE') {
      if (!isAuthorized(req)) return sendJson(res, 401, { errors: { auth: ['unauthorized'] } });
      articles.delete(article.slug);
      return sendJson(res, 200, {});
    }
  }

  // --- UI ---
  if (req.method === 'GET' && path === '/') {
    const items = [...articles.values()]
      .map((a) => `<li><a href="/article/${encodeURIComponent(a.slug)}">${escapeHtml(a.title)}</a></li>`)
      .join('');
    return sendHtml(res, 200, 'Conduit', `<h1>conduit</h1><ul>${items || '<li>No articles yet</li>'}</ul>`);
  }

  if (req.method === 'GET' && path === '/editor') {
    return sendHtml(res, 200, 'Editor', '<h1>New article</h1><div id="editor"></div>');
  }

  if (req.method === 'GET' && path === '/login') {
    return sendHtml(res, 200, 'Sign in', '<h1>Sign in</h1><p>In the demo-app, login is done via the API.</p>');
  }

  const uiArticle = path.match(/^\/article\/([^/]+)$/);
  if (req.method === 'GET' && uiArticle) {
    const article = articles.get(uiArticle[1]);
    if (!article) return sendHtml(res, 404, 'Not found', '<h1>Article not found</h1>');
    return sendHtml(
      res,
      200,
      article.title,
      `<h1>${escapeHtml(article.title)}</h1><div class="article-content"><p>${escapeHtml(article.body)}</p></div>`,
    );
  }

  return sendJson(res, 404, { errors: { path: ['not found'] } });
}).listen(PORT, () => console.log(`[demo-app] http://localhost:${PORT}`));
