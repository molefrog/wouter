import { Route, Link, Switch, useSearch, useLocation } from "wouter";
import { navigate } from "wouter/use-browser-location";

function Logo() {
  return <i className="iconoir-home-simple-door text-2xl" />;
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const [location] = useLocation();
  const isActive = href === "/" ? location === "/" : location.startsWith(href);

  return (
    <Link
      href={href}
      className={`text-sm font-medium ${
        isActive ? "text-gray-900" : "text-gray-500 hover:text-gray-900"
      }`}
    >
      {children}
    </Link>
  );
}

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white py-2">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>

        <div className="flex items-center gap-8">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/about">About</NavLink>
          <NavLink href="/users/alice">Alice</NavLink>
          <NavLink href="/users/bob">Bob</NavLink>
        </div>

        <Link href="/cart" className="relative flex items-center">
          <i className="iconoir-cart text-xl" />
          <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-gray-900 text-[10px] font-semibold text-white">
            7
          </span>
        </Link>
      </div>
    </nav>
  );
}

function HomePage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const category = params.get("category") || "all";
  const sort = params.get("sort") || "newest";

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(search);
    if (value === "all" || value === "newest") {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    const queryString = newParams.toString();
    navigate(queryString ? `/?${queryString}` : "/");
  };

  return (
    <>
      <h1 className="text-3xl font-bold">Home Page</h1>
      <p className="mt-2 text-gray-600">Welcome to the Wouter SSR demo!</p>
      <p className="text-gray-600">
        This page is server-side rendered with Bun + React + Wouter.
      </p>

      <div className="mt-6 rounded-lg bg-gray-50 p-6">
        <h3 className="text-lg font-semibold">Filters (using useSearch)</h3>
        <div className="mt-4 flex gap-6">
          <label className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Category:</span>
            <select
              value={category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="rounded border border-gray-300 px-3 py-1.5 text-sm"
            >
              <option value="all">All</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="books">Books</option>
            </select>
          </label>

          <label className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort:</span>
            <select
              value={sort}
              onChange={(e) => handleFilterChange("sort", e.target.value)}
              className="rounded border border-gray-300 px-3 py-1.5 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </label>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Current search:{" "}
          <code className="bg-gray-200 px-1 rounded">
            {search || "(empty)"}
          </code>
        </p>
      </div>
    </>
  );
}

export function App() {
  return (
    <div className="min-h-screen bg-white pt-16">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <Switch>
          <Route path="/">
            <HomePage />
          </Route>

          <Route path="/about">
            <h1 className="text-3xl font-bold">About</h1>
            <p className="mt-2 text-gray-600">
              This is a simple SSR demo showcasing wouter v3.8.0.
            </p>
            <ul className="mt-4 list-disc pl-6 text-gray-600 space-y-1">
              <li>Server-side rendering with React 19</li>
              <li>Client-side hydration</li>
              <li>Routing with wouter</li>
              <li>Powered by Bun</li>
            </ul>
          </Route>

          <Route path="/users/:name">
            {(params) => (
              <>
                <h1 className="text-3xl font-bold">User Profile</h1>
                <p className="mt-2 text-gray-600">Hello, {params.name}!</p>
                <p className="text-gray-600">
                  This route demonstrates dynamic parameters in SSR.
                </p>
              </>
            )}
          </Route>

          <Route path="/cart">
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <p className="mt-2 text-gray-600">Your cart is empty.</p>
          </Route>

          <Route>
            <h1 className="text-3xl font-bold">404 - Not Found</h1>
            <p className="mt-2 text-gray-600">
              The page you're looking for doesn't exist.
            </p>
          </Route>
        </Switch>
      </main>
    </div>
  );
}
