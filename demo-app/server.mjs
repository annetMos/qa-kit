/**
 * Мини-приложение в стиле RealWorld (Conduit) для демонстрации и CI.
 * Только то, что нужно примерам: логин, CRUD статей, страница статьи.
 * Данные хранятся в памяти и сбрасываются при перезапуске.
 *
 * Запуск: npm run demo  →  http://localhost:4555
 */
import { createServer } from 'node:http';

const PORT = Number(process.env.DEMO_PORT ?? 4555);
const DEMO_USER = { email: 'qa@example.com', password: 'qa-password', username: 'qa' };
const TOKEN = 'demo-jwt-token';

/** @type {Map<string, {slug: string, title: string, description: string, body: string, tagList: string[], createdAt: string}>} */
const articles = new Map();

const escapeHtml = (text) =>
  String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const slugify = (title) =>
  `${title.toLowerCase().replace(/[^a-z0-9а-яё]+/gi, '-').replace(/^-|-$/g, '')}-${Math.random().toString(36).slice(2, 8)}`;

const sendJson = (res, status, body) => {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
};

const sendHtml = (res, status, title, content) => {
  res.writeHead(status, { 'content-type': 'text/html; charset=utf-8' });
  res.end(`<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
<body><nav><a href="/">conduit</a></nav><main>${content}</main></body></html>`);
};

const isAuthorized = (req) => req.headers.authorization === `Token ${TOKEN}`;

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
    return sendHtml(res, 200, 'Conduit', `<h1>conduit</h1><ul>${items || '<li>Статей пока нет</li>'}</ul>`);
  }

  const uiArticle = path.match(/^\/article\/([^/]+)$/);
  if (req.method === 'GET' && uiArticle) {
    const article = articles.get(uiArticle[1]);
    if (!article) return sendHtml(res, 404, 'Not found', '<h1>Статья не найдена</h1>');
    return sendHtml(
      res,
      200,
      article.title,
      `<h1>${escapeHtml(article.title)}</h1><div class="article-content"><p>${escapeHtml(article.body)}</p></div>`,
    );
  }

  return sendJson(res, 404, { errors: { path: ['not found'] } });
}).listen(PORT, () => console.log(`[demo-app] http://localhost:${PORT}`));
