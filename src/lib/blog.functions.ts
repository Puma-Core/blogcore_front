import { createServerFn } from "@tanstack/react-start";
import {
  BLOG_API_BASE_URL,
  type AuthorProfile,
  type PaginatedPosts,
  type PostDetail,
} from "./blog-api";

async function apiGet<T>(path: string): Promise<{ data: T | null; status: number }> {
  const response = await fetch(`${BLOG_API_BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    return { data: null, status: response.status };
  }

  return { data: (await response.json()) as T, status: response.status };
}

export const fetchAuthor = createServerFn({ method: "GET" })
  .inputValidator((data: { username: string }) => data)
  .handler(async ({ data }) => {
    const username = encodeURIComponent(data.username);
    const { data: author, status } = await apiGet<AuthorProfile>(`/api/authors/${username}/`);

    if (!author) {
      return { author: null, error: status === 404 ? "not_found" : "unavailable" } as const;
    }

    return { author, error: null } as const;
  });

export const fetchAuthorPosts = createServerFn({ method: "GET" })
  .inputValidator((data: { username: string; page?: number }) => data)
  .handler(async ({ data }) => {
    const username = encodeURIComponent(data.username);
    const page = data.page && data.page > 1 ? `?page=${data.page}` : "";
    const { data: posts, status } = await apiGet<PaginatedPosts>(
      `/api/authors/${username}/posts/${page}`,
    );

    if (!posts) {
      return {
        posts: null,
        error: status === 404 ? "not_found" : "unavailable",
      } as const;
    }

    return { posts, error: null } as const;
  });

export const fetchPost = createServerFn({ method: "GET" })
  .inputValidator((data: { username: string; uniqueName: string }) => data)
  .handler(async ({ data }) => {
    const username = encodeURIComponent(data.username);
    const uniqueName = encodeURIComponent(data.uniqueName);
    const { data: post, status } = await apiGet<PostDetail>(
      `/api/authors/${username}/posts/${uniqueName}/`,
    );

    if (!post) {
      return { post: null, error: status === 404 ? "not_found" : "unavailable" } as const;
    }

    return { post, error: null } as const;
  });

const ABOUT_MARKDOWN_URL =
  "https://raw.githubusercontent.com/Puma-Core/BlogCore/refs/heads/main/ABOUT.md";

export const fetchAboutMarkdown = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => data)
  .handler(async () => {
    const response = await fetch(ABOUT_MARKDOWN_URL, {
      headers: { Accept: "text/markdown,text/plain,*/*" },
    });

    if (!response.ok) {
      return "Could not load the About content. Please try again later.";
    }

    return response.text();
  });
