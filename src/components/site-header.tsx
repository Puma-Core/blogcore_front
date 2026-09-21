import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 mx-auto max-w-full bg-background px-5 md:max-w-[85%] lg:max-w-[75%]">
      <div className="flex items-center justify-between py-4">
        <Link to="/" className="inline-flex items-center gap-2">
          <img
            src="https://public-bucket.pumacore.com/blogcore/public/logo.png"
            alt="BlogCore"
            className="h-10 w-auto"
          />
          <span className="font-heading text-xl font-semibold text-foreground">
            BlogCore
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            to="/"
            className="border border-foreground/20 px-4 py-1.5 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Authors
          </Link>
          <Link
            to="/about"
            activeProps={{ className: "bg-accent text-accent-foreground" }}
            className="border border-foreground/20 px-4 py-1.5 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            About
          </Link>
        </nav>
      </div>
      <hr className="m-0 w-full border-0 border-t-2 border-accent" />
    </header>
  );
}
