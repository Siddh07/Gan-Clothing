const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'node_modules', 'next-auth', 'next', 'index.js');

if (!fs.existsSync(targetFile)) {
  process.exit(0);
}

let content = fs.readFileSync(targetFile, 'utf8');

// Patch NextAuthRouteHandler for Next.js 15 async cookies/headers/params
const target1 = `  const nextauth = (_context$params = context.params) === null || _context$params === void 0 ? void 0 : _context$params.nextauth;
  const query = Object.fromEntries(req.nextUrl.searchParams);
  const body = await (0, _utils.getBody)(req);
  const internalResponse = await (0, _core.AuthHandler)({
    req: {
      body,
      query,
      cookies: Object.fromEntries(cookies().getAll().map(c => [c.name, c.value])),
      headers: Object.fromEntries(headers()),`;

const replacement1 = `  const resolvedParams = context && context.params instanceof Promise ? await context.params : (context ? context.params : undefined);
  const nextauth = resolvedParams ? resolvedParams.nextauth : undefined;
  const query = Object.fromEntries(req.nextUrl.searchParams);
  const body = await (0, _utils.getBody)(req);

  const rawCookies = cookies();
  const cookieStore = rawCookies instanceof Promise ? await rawCookies : rawCookies;
  const rawHeaders = headers();
  const headerStore = rawHeaders instanceof Promise ? await rawHeaders : rawHeaders;

  const parsedCookies = cookieStore && typeof cookieStore.getAll === "function"
    ? Object.fromEntries(cookieStore.getAll().map(c => [c.name, c.value]))
    : {};
  const parsedHeaders = headerStore && typeof headerStore.entries === "function"
    ? Object.fromEntries(headerStore.entries())
    : (headerStore ? Object.fromEntries(headerStore) : {});

  const internalResponse = await (0, _core.AuthHandler)({
    req: {
      body,
      query,
      cookies: parsedCookies,
      headers: parsedHeaders,`;

if (content.includes(target1)) {
  content = content.replace(target1, replacement1);
}

// Patch getServerSession for Next.js 15 async cookies/headers
const target2 = `    req = {
      headers: Object.fromEntries(headers()),
      cookies: Object.fromEntries(cookies().getAll().map(c => [c.name, c.value]))
    };`;

const replacement2 = `    const rawCookies = cookies();
    const cookieStore = rawCookies instanceof Promise ? await rawCookies : rawCookies;
    const rawHeaders = headers();
    const headerStore = rawHeaders instanceof Promise ? await rawHeaders : rawHeaders;

    const parsedCookies = cookieStore && typeof cookieStore.getAll === "function"
      ? Object.fromEntries(cookieStore.getAll().map(c => [c.name, c.value]))
      : {};
    const parsedHeaders = headerStore && typeof headerStore.entries === "function"
      ? Object.fromEntries(headerStore.entries())
      : (headerStore ? Object.fromEntries(headerStore) : {});

    req = {
      headers: parsedHeaders,
      cookies: parsedCookies
    };`;

if (content.includes(target2)) {
  content = content.replace(target2, replacement2);
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('✅ next-auth patched for Next.js 15 compatibility.');
