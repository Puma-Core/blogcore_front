import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { getRecentSearches } from "@/lib/recent-searches";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BlogCore — Find an author and read their posts" },
      {
        name: "description",
        content:
          "Search a BlogCore author by their public username to read their profile and published posts.",
      },
      { property: "og:title", content: "BlogCore — Find an author and read their posts" },
      {
        property: "og:description",
        content:
          "Search a BlogCore author by their public username to read their profile and published posts.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setRecent(getRecentSearches());
  }, []);

  const query = username.trim().toLowerCase();
  const suggestions = recent.filter((item) => item.toLowerCase().includes(query));

  function go(value: string) {
    const target = value.trim();
    if (!target) return;
    setOpen(false);
    void navigate({ to: "/authors/$username", params: { username: target } });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    go(username);
  }

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-full flex-col justify-center px-5 py-16 md:max-w-[85%] lg:max-w-[75%]">
      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Welcome</p>
      <h1 className="mt-4 font-serif text-5xl leading-tight text-foreground sm:text-6xl">
        Read what authors publish.
      </h1>
      <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
        Type an author&apos;s public username to open their profile and browse every post they have
        written.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-3 sm:flex-row">
        <div className="relative w-full">
          <input
            type="text"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 150)}
            placeholder="Author username, e.g. jane-doe"
            aria-label="Author username"
            autoComplete="off"
            className="w-full border border-border bg-card px-4 py-3 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent"
          />
          {open && suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 top-full z-20 max-h-64 overflow-auto border border-t-0 border-border bg-card">
              <li className="px-4 pt-3 text-xs font-bold uppercase tracking-[0.2em] text-accent">
                Recent searches
              </li>
              {suggestions.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => go(item)}
                    className="block w-full px-4 py-3 text-left font-mono text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    /{item}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="submit"
          className="bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          disabled={!username.trim()}
        >
          Search
        </button>
      </form>
    </main>
  );
}
