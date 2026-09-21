import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { fetchAuthor, fetchPost } from "@/lib/blog.functions";

const postQuery = (username: string, uniqueName: string) =>
  queryOptions({
    queryKey: ["post", username, uniqueName],
    queryFn: () => fetchPost({ data: { username, uniqueName } }),
  });

const authorQuery = (username: string) =>
  queryOptions({
    queryKey: ["author", username],
    queryFn: () => fetchAuthor({ data: { username } }),
  });

export const Route = createFileRoute("/authors/$username/$post")({
  loader: async ({ context, params }) => {
    const [postResult, authorResult] = await Promise.all([
      context.queryClient.ensureQueryData(postQuery(params.username, params.post)),
      context.queryClient.ensureQueryData(authorQuery(params.username)),
    ]);
    return {
      postTitle: postResult.post?.title ?? null,
      authorName: authorResult.author?.fullname ?? postResult.post?.author_full_name ?? null,
      authorPhotoUrl: authorResult.author?.photo_url ?? null,
    };
  },
  head: ({ loaderData }) => {
    const title = loaderData?.postTitle ? `${loaderData.postTitle} — BlogCore` : "Post — BlogCore";
    const description = loaderData?.postTitle
      ? `Read "${loaderData.postTitle}" by ${loaderData.authorName ?? "the author"} on BlogCore.`
      : "Read this post on BlogCore.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: PostPage,
});

function PostPage() {
  const { username, post: uniqueName } = Route.useParams();
  const { data: postData } = useSuspenseQuery(postQuery(username, uniqueName));
  const { data: authorData } = useSuspenseQuery(authorQuery(username));

  if (!postData.post) {
    return (
      <main className="min-h-[calc(100vh-4rem)] px-5 py-20 text-center">
        <div className="mx-auto max-w-full md:max-w-[85%] lg:max-w-[75%]">
          <h1 className="font-serif text-3xl text-foreground">
            {postData.error === "not_found" ? "Content not found" : "Service unavailable"}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {postData.error === "not_found"
              ? "This post does not exist or is no longer published."
              : "We could not reach the blog service. Please try again later."}
          </p>
          <Link
            to="/authors/$username"
            params={{ username }}
            className="mt-8 inline-block text-sm text-foreground underline"
          >
            Back to the author
          </Link>
        </div>
      </main>
    );
  }

  const post = postData.post;
  const author = authorData.author;
  const authorInitials = getInitials(author?.fullname ?? post.author_full_name);

  return (
    <main className="min-h-[calc(100vh-4rem)] px-5 py-12">
      <article className="relative z-10 mx-auto max-w-full md:max-w-[85%] lg:max-w-[75%]">
        <Link
          to="/authors/$username"
          params={{ username }}
          className="text-base text-foreground/80 underline-offset-4 hover:text-foreground hover:underline"
        >
          ← {post.author_full_name}
        </Link>

        <h1 className="mt-6 font-serif text-5xl leading-tight text-foreground">{post.title}</h1>
        <p className="mt-3 text-base text-muted-foreground">
          By {post.author_full_name} ·{" "}
          {new Date(post.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <div className="mx-auto mt-8 w-[90%] text-base leading-relaxed text-foreground [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-foreground/20 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:bg-foreground/10 [&_code]:px-1 [&_h1]:mt-8 [&_h1]:font-serif [&_h1]:text-[26px] [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-[24px] [&_h3]:mt-6 [&_h3]:font-serif [&_h3]:text-[22px] [&_h4]:mt-6 [&_h4]:font-serif [&_h4]:text-[20px] [&_h5]:mt-5 [&_h5]:font-serif [&_h5]:text-[18px] [&_h6]:mt-5 [&_h6]:font-serif [&_h6]:text-[16px] [&_hr]:my-8 [&_hr]:border-foreground/20 [&_img]:mx-auto [&_img]:my-6 [&_img]:block [&_img]:h-auto [&_img]:w-4/5 [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-4 [&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:bg-foreground/5 [&_pre]:p-4 [&_strong]:font-semibold [&_table]:my-6 [&_table]:w-full [&_td]:border [&_td]:border-foreground/20 [&_td]:p-2 [&_th]:border [&_th]:border-foreground/20 [&_th]:p-2 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>

        <footer className="mt-12 border-t border-border pt-6">
          <Link
            to="/authors/$username"
            params={{ username }}
            className="inline-flex items-center gap-4 hover:opacity-80"
          >
            {author?.photo_url ? (
              <img
                src={author.photo_url}
                alt={author.fullname}
                className="h-20 w-20 object-cover"
              />
            ) : (
              <span className="flex h-20 w-20 items-center justify-center bg-[#0072BB] text-xl font-semibold text-white">
                {authorInitials}
              </span>
            )}
            <span>
              <span className="block text-xs font-bold uppercase tracking-[0.2em] text-accent">
                Posted by
              </span>
              <span className="mt-1 block font-serif text-2xl text-foreground">
                {post.author_full_name}
              </span>
              <span className="mt-1 block font-mono text-xs text-muted-foreground">
                /{post.public_username} ·{" "}
                {new Date(post.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </span>
          </Link>
        </footer>
      </article>
    </main>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
