import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { fetchAboutMarkdown } from "@/lib/blog.functions";

const aboutQuery = () =>
  queryOptions({
    queryKey: ["about"],
    queryFn: () => fetchAboutMarkdown({ data: undefined }),
  });

export const Route = createFileRoute("/about")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(aboutQuery());
  },
  head: () => ({
    meta: [
      { title: "About — BlogCore" },
      { name: "description", content: "Learn more about BlogCore." },
      { property: "og:title", content: "About — BlogCore" },
      { property: "og:description", content: "Learn more about BlogCore." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { data: markdown } = useSuspenseQuery(aboutQuery());

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background px-5 py-12">
      <article className="mx-auto max-w-full md:max-w-[85%] lg:max-w-[75%]">
        <h1 className="font-serif text-5xl leading-tight text-foreground">About</h1>
        <div className="mx-auto mt-8 w-full text-base leading-relaxed text-foreground [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-foreground/20 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:bg-foreground/10 [&_code]:px-1 [&_code]:text-[12px] [&_h1]:mt-8 [&_h1]:font-serif [&_h1]:text-[26px] [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-[24px] [&_h3]:mt-6 [&_h3]:font-serif [&_h3]:text-[22px] [&_h4]:mt-6 [&_h4]:font-serif [&_h4]:text-[20px] [&_h5]:mt-5 [&_h5]:font-serif [&_h5]:text-[18px] [&_h6]:mt-5 [&_h6]:font-serif [&_h6]:text-[16px] [&_hr]:my-8 [&_hr]:border-foreground/20 [&_img]:mx-auto [&_img]:my-6 [&_img]:block [&_img]:h-auto [&_img]:w-4/5 [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-4 [&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:bg-foreground/5 [&_pre]:p-4 [&_pre]:text-[12px] [&_strong]:font-semibold [&_table]:my-6 [&_table]:w-full [&_td]:border [&_td]:border-foreground/20 [&_td]:p-2 [&_th]:border [&_th]:border-foreground/20 [&_th]:p-2 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </div>
      </article>
    </main>
  );
}
