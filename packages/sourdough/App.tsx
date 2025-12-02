import { Route, Link, Switch, useSearch } from "wouter";
import { navigate } from "wouter/use-browser-location";

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
      <h1>Home Page</h1>
      <p>Welcome to the Wouter SSR demo!</p>
      <p>This page is server-side rendered with Bun + React + Wouter.</p>

      <div
        style={{ marginTop: "1rem", padding: "1rem", background: "#f5f5f5" }}
      >
        <h3>Filters (using useSearch)</h3>
        <div style={{ display: "flex", gap: "1rem" }}>
          <label>
            Category:{" "}
            <select
              value={category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
            >
              <option value="all">All</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="books">Books</option>
            </select>
          </label>

          <label>
            Sort:{" "}
            <select
              value={sort}
              onChange={(e) => handleFilterChange("sort", e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </label>
        </div>
        <p style={{ marginTop: "0.5rem", fontSize: "0.9em", color: "#666" }}>
          Current search: <code>{search || "(empty)"}</code>
        </p>
      </div>
    </>
  );
}

export function App() {
  return (
    <>
      <nav>
        <Link href="/">Home</Link> | <Link href="/about">About</Link> |{" "}
        <Link href="/users/alice">Alice</Link> |{" "}
        <Link href="/users/bob">Bob</Link>
      </nav>

      <main>
        <Switch>
          <Route path="/">
            <HomePage />
          </Route>

          <Route path="/about">
            <h1>About</h1>
            <p>This is a simple SSR demo showcasing wouter v3.8.0.</p>
            <ul>
              <li>Server-side rendering with React 19</li>
              <li>Client-side hydration</li>
              <li>Routing with wouter</li>
              <li>Powered by Bun</li>
            </ul>
          </Route>

          <Route path="/users/:name">
            {(params) => (
              <>
                <h1>User Profile</h1>
                <p>Hello, {params.name}!</p>
                <p>This route demonstrates dynamic parameters in SSR.</p>
              </>
            )}
          </Route>

          <Route>
            <h1>404 - Not Found</h1>
            <p>The page you're looking for doesn't exist.</p>
          </Route>
        </Switch>
      </main>
    </>
  );
}
