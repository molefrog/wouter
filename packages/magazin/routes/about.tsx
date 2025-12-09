import { Link } from "wouter";
import { Helmet } from "@dr.pogodin/react-helmet";

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="text-neutral-800 flex items-center gap-3">
      <i className="iconoir-cable-tag-solid text-blue-500 text-xl" />
      {children}
    </li>
  );
}

export function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About</title>
      </Helmet>

      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-2">
        What is this?
      </h1>
      <p className="text-neutral-500 max-w-lg mb-16">
        This is a simple SSR demo showcasing wouter v3.8.0, React 19 with
        server-side rendering and client-side hydration running on Bun.
      </p>

      <div className="text-sm text-neutral-400 mb-2">Features</div>
      <ul className="mt-4 list-inside list-nonespace-y-1 grid grid-cols-2 gap-3.5">
        <Feature>
          <Link href="/products/hook-keyring-rvst" className="hover:underline">
            Dynamic segments
          </Link>
        </Feature>
        <Feature>
          <Link href="/this-page-does-not-exist" className="hover:underline">
            Default switch route (404)
          </Link>
        </Feature>
        <Feature>
          <Link
            href="/?category=electronics&sort=price-desc"
            className="hover:underline"
          >
            Search parameters
          </Link>
        </Feature>
        <Feature>
          <Link href="/featured" className="hover:underline">
            Redirect with SSR support
          </Link>
        </Feature>
        <Feature>
          <Link href="/about" className="hover:underline">
            Active links
          </Link>
        </Feature>
        <Feature>
          <Link href="/cart" state={{ addedItem: "Demo Product" }} className="hover:underline">
            Navigation with state
          </Link>
        </Feature>
        <Feature>
          <Link href="/this-page-does-not-exist" className="hover:underline">
            Custom status codes (404)
          </Link>
        </Feature>
        <Feature>
          <span className="text-neutral-400">View transitions (soon)</span>
        </Feature>
      </ul>
    </>
  );
}
