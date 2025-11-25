import { Route, Link, Switch } from "wouter";

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
            <h1>Home Page</h1>
            <p>Welcome to the Wouter SSR demo!</p>
            <p>This page is server-side rendered with Bun + React + Wouter.</p>
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
