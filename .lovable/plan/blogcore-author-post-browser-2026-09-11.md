# BlogCore — Author & Post Browser

A multi-page site (not a single page) in English, simple and clean, that looks up an author by their username and shows their posts, with a full page for each post.

## Pages

1. **Home (`/`)** — Welcome heading, short intro, and a text input for the author's username with a "Search" button. Submitting goes to the author page.
2. **Author (`/authors/{username}`)** — Header bar "BlogCore" with an "Authors" link, then the author block: title, short description, `/public_username`, and photo with full name and subtitle on the right (matching the sketch). Below, a "Posts" section listing each post as a card with title and preview text, linking to the post page. If the author has no posts: "No content found." If the author does not exist: "Author not found."
3. **Post (`/authors/{username}/{post}`)** — Full post: title, author name, publication date, and complete content, with a back link to the author.

All copy in English. Loading and error states on every page.

## Data

Content comes from the existing blog API at `https://admin-blog.pumacore.com`:
- author profile: `/api/authors/{public_username}/`
- author posts (paginated): `/api/authors/{public_username}/posts/`
- single post: `/api/authors/{public_username}/posts/{unique_name}/`

Pagination on the posts list: "Load more" button when there are further pages.

## Design

Simple, editorial, light theme: neutral background, one accent color, generous whitespace, serif headings + clean sans body, rounded cards with thin borders — close to the sketch. Colors defined as design tokens, no hardcoded values.

## Technical notes

- TanStack Start file routes: `index.tsx`, `authors.$username.index.tsx`, `authors.$username.$post.tsx`, plus a shared header layout.
- API calls go through `createServerFn` wrappers (server-side fetch) so pages render server-side and are indexable; TanStack Query handles caching via loader `ensureQueryData` + `useSuspenseQuery`.
- Base URL kept in one config constant so switching dev/production is a one-line change.
- Per-route `head()` metadata: author page uses the author name/description, post page uses the post title.
- 404-style handling: missing author or post renders a not-found message instead of an error screen.
