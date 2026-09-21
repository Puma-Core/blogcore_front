import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Facebook,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { PostListItem } from "@/lib/blog-api";
import { fetchAuthor, fetchAuthorPosts } from "@/lib/blog.functions";
import { addRecentSearch } from "@/lib/recent-searches";

const authorQuery = (username: string) =>
  queryOptions({
    queryKey: ["author", username],
    queryFn: () => fetchAuthor({ data: { username } }),
  });

const postsQuery = (username: string) =>
  queryOptions({
    queryKey: ["author-posts", username],
    queryFn: () => fetchAuthorPosts({ data: { username } }),
  });

type SocialLink = {
  label: string;
  url: string | null;
  iconUrl?: string | null;
};

const socialIcons: Record<string, LucideIcon> = {
  facebook: Facebook,
  github: Github,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
};

function normalizeSocialUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;

  const candidate = value.trim().startsWith("www.") ? `https://${value.trim()}` : value.trim();

  try {
    const url = new URL(candidate);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function socialLabel(value: string) {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, "");
  const labels: Record<string, string> = {
    facebook: "Facebook",
    github: "GitHub",
    instagram: "Instagram",
    linkedin: "LinkedIn",
    twitter: "X",
    x: "X",
    youtube: "YouTube",
    website: "Website",
    web: "Website",
  };
  return labels[normalized] ?? value;
}

function parseSocialNetworks(value: unknown): SocialLink[] {
  if (!value) return [];

  let parsed = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      const url = normalizeSocialUrl(value);
      return url ? [{ label: "Website", url }] : [];
    }
  }

  if (Array.isArray(parsed)) {
    return parsed.flatMap((item): SocialLink[] => {
      if (typeof item === "string") {
        const url = normalizeSocialUrl(item);
        if (!url) return [];
        const hostname = new URL(url).hostname.replace(/^www\./, "");
        return [{ label: socialLabel(hostname.split(".")[0] ?? "Website"), url }];
      }

      if (!item || typeof item !== "object") return [];
      const record = item as Record<string, unknown>;
      const url = normalizeSocialUrl(record["url"] ?? record["link"] ?? record["value"]);
      const iconUrl = normalizeSocialUrl(record["icon_url"] ?? record["icon"] ?? record["image"]);
      const name = record["name"] ?? record["platform"] ?? record["network"] ?? record["type"];
      if (!url && !iconUrl && typeof name !== "string") return [];
      return [
        { label: socialLabel(typeof name === "string" ? name : "Website"), url, iconUrl },
      ];
    });
  }

  if (typeof parsed === "object") {
    return Object.entries(parsed as Record<string, unknown>).flatMap(([name, rawUrl]) => {
      const url = normalizeSocialUrl(rawUrl);
      return url ? [{ label: socialLabel(name), url }] : [];
    });
  }

  return [];
}

function SocialLinks({ networks, className = "" }: { networks: unknown; className?: string }) {
  const links = parseSocialNetworks(networks);
  if (links.length === 0) return null;

  return (
    <ul
      className={`flex flex-wrap items-center gap-x-6 gap-y-3 ${className}`}
      aria-label="Social networks"
    >
      {links.map(({ label, url, iconUrl }) => {
        const Icon = socialIcons[label.toLowerCase()] ?? Globe;
        const className =
          "group flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
        const inner = (
          <>
            {iconUrl ? (
              <img
                src={iconUrl}
                alt=""
                className="h-5 w-5 object-contain transition-transform group-hover:-translate-y-0.5"
                loading="lazy"
              />
            ) : label === "X" ? (
              <span
                className="text-base font-medium leading-none transition-transform group-hover:-translate-y-0.5"
                aria-hidden="true"
              >
                X
              </span>
            ) : (
              <Icon
                className="h-5 w-5 transition-transform group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            )}
            {label}
          </>
        );
        return (
          <li key={`${label}-${url ?? iconUrl ?? ""}`}>
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${label} profile (opens in a new tab)`}
                className={className}
              >
                {inner}
              </a>
            ) : (
              <span className={className} aria-label={label}>
                {inner}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export const Route = createFileRoute("/authors/$username/")({
  loader: async ({ context, params }) => {
    const result = await context.queryClient.ensureQueryData(authorQuery(params.username));
    void context.queryClient.prefetchQuery(postsQuery(params.username));
    return { authorName: result.author?.fullname ?? null };
  },
  head: ({ loaderData, params }) => {
    const name = loaderData?.authorName ?? params.username;
    const title = `${name} — BlogCore`;
    const description = `Profile and published posts by ${name} on BlogCore.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: AuthorPage,
});

function AuthorPage() {
  const { username } = Route.useParams();
  const { data: authorResult } = useSuspenseQuery(authorQuery(username));
  const foundUsername = authorResult.author?.public_username ?? null;

  useEffect(() => {
    if (foundUsername) addRecentSearch(foundUsername);
  }, [foundUsername]);


  if (!authorResult.author) {
    return (
      <main className="mx-auto max-w-full px-5 py-20 text-center md:max-w-[85%] lg:max-w-[75%]">
        <h1 className="font-serif text-3xl text-foreground">
          {authorResult.error === "not_found" ? "Author not found" : "Service unavailable"}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {authorResult.error === "not_found"
            ? `No author matches the username "${username}".`
            : "We could not reach the blog service. Please try again later."}
        </p>
        <Link to="/" className="mt-8 inline-block text-sm text-foreground underline">
          Search another author
        </Link>
      </main>
    );
  }

  const author = authorResult.author;

  return (
    <main className="mx-auto max-w-full px-5 py-12 md:max-w-[85%] md:py-16 lg:max-w-[75%]">
      <section>
        <div className="flex items-center gap-4">
          {author.photo_url ? (
            <img
              src={author.photo_url}
              alt={author.fullname}
              className="h-16 w-16 border border-border object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center bg-accent text-xl font-medium tracking-tighter text-accent-foreground">
              {author.first_name?.[0] ?? "?"}
              {author.last_name?.[0] ?? ""}
            </div>
          )}
          <div>
            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-accent">
              Profile
            </span>
            <p className="font-mono text-sm text-muted-foreground">/{author.public_username}</p>
            <p className="text-sm font-medium text-foreground">{author.fullname}</p>
          </div>
        </div>

        <h1 className="mt-8 font-serif text-5xl leading-none tracking-tight text-foreground md:text-7xl">
          {author.title}
        </h1>

        <p className="mt-6 max-w-xl text-lg font-light leading-relaxed text-muted-foreground">
          {author.short_description}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <SocialLinks networks={author.social_networks} />
          {author.subtitle && (
            <>
              <div className="hidden h-px w-8 bg-border sm:block" aria-hidden="true" />
              <span className="font-mono text-xs text-muted-foreground">{author.subtitle}</span>
            </>
          )}
        </div>
      </section>

      <hr className="my-10 border-border md:my-14" />

      <PostsSection username={username} />
    </main>
  );
}

function PostsSection({ username }: { username: string }) {
  const { data } = useSuspenseQuery(postsQuery(username));
  const [extraPosts, setExtraPosts] = useState<PostListItem[]>([]);
  const [hasNext, setHasNext] = useState(Boolean(data.posts?.next));
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    setLoading(true);
    const nextPage = page + 1;
    const result = await fetchAuthorPosts({ data: { username, page: nextPage } });
    if (result.posts) {
      setExtraPosts((current) => [...current, ...result.posts.results]);
      setHasNext(Boolean(result.posts.next));
      setPage(nextPage);
    } else {
      setHasNext(false);
    }
    setLoading(false);
  }

  const posts = [...(data.posts?.results ?? []), ...extraPosts];

  return (
    <section>
      <div className="flex items-baseline justify-between border-b-2 border-accent pb-4">
        <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-foreground">Posts</h2>
        <span className="font-mono text-xs text-muted-foreground">
          [ {String(posts.length).padStart(2, "0")} {posts.length === 1 ? "article" : "articles"} ]
        </span>
      </div>

      {posts.length === 0 ? (
        <p className="mt-10 border border-dashed border-border px-5 py-8 text-center text-muted-foreground">
          Content not found.
        </p>
      ) : (
        <ul className="divide-y divide-border border-b border-border">
          {posts.map((post) => (
            <li key={post.unique_name}>
              <Link
                to="/authors/$username/$post"
                params={{ username, post: post.unique_name }}
                className="group flex flex-col justify-between gap-4 py-8 transition-all hover:px-4 md:flex-row md:items-baseline"
              >
                <div className="space-y-2">
                  <span className="block font-mono text-xs uppercase text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                    })}
                  </span>
                  <h3 className="text-2xl font-medium text-foreground transition-colors group-hover:text-accent md:text-3xl">
                    {post.title}
                  </h3>
                  <p className="line-clamp-2 max-w-2xl text-sm text-muted-foreground">
                    {post.content_preview}
                  </p>
                </div>
                <ArrowRight
                  className="h-6 w-6 shrink-0 self-center text-muted-foreground/50 transition-all group-hover:translate-x-2 group-hover:text-accent md:self-auto"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {hasNext && (
        <div className="mt-8">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-accent disabled:opacity-60"
          >
            {loading ? "Loading…" : "Load more"}
            <span className="text-lg leading-none" aria-hidden="true">
              +
            </span>
          </button>
        </div>
      )}
    </section>
  );
}
