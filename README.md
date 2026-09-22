# BlogCore Frontend

Static client-side application built with Vite, HTML, CSS, and browser JavaScript. It has no React, SSR, TanStack Start, or runtime server.

## Development

```sh
npm install
npm run dev
```

Vite proxies `/api` to `https://admin-blog.pumacore.com` during development, so author and post queries work locally.

## Production build

```sh
npm run build
```

The deployable static files are generated in `dist/`.

## Apache deployment

Build and upload the contents of `dist/` to the Apache document root. Do not upload the repository root or open `dist/index.html` using `file://`.

```sh
npm run build
rsync -a --delete dist/ /var/www/blogcore/dist/
```

To deploy below an Apache path such as `http://fhome:7070/blogcore_front/`, build with that path:

```sh
VITE_BASE_PATH=/blogcore_front/ npm run build
```

Add the directives from `apache/blogcore-subpath.conf` to the VirtualHost that serves `fhome:7070`. The bundled `.htaccess` rewrites client-side routes below that path to `index.html`.

Copy `apache/blogcore.conf` to Apache's site configuration directory and replace `blog.example.com` and `/var/www/blogcore/dist` with the real values. The configuration:

- Serves the static Vite build.
- Rewrites client-side routes such as `/authors/jane-doe` to `index.html`.
- Proxies `/api` to the BlogCore API, avoiding the API's CORS restriction.

Enable the Apache modules `rewrite`, `proxy`, `proxy_http`, and `ssl`. For a shared host without VirtualHost access, `dist/.htaccess` provides the route rewrite, but the provider must configure the `/api` proxy or the API must enable CORS.

## API configuration

The BlogCore API does not currently allow cross-origin browser requests. A static deployment therefore needs an API proxy at `/api`, or CORS enabled by the API server.

To use a different API proxy at build time, define `VITE_API_BASE_URL`:

```sh
VITE_API_BASE_URL=https://api-proxy.example.com npm run build
```

The proxy must expose the same paths as the BlogCore API, for example `/api/authors/:username/`.

## Client-side routing

The application uses the History API for `/`, `/about`, `/authors/:username`, and `/authors/:username/:post`. Configure the static host to rewrite unknown routes to `index.html` so direct links continue to work.
