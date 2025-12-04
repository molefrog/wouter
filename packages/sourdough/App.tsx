import { Route, Link, Switch, Redirect } from "wouter";
import { HomePage } from "@/routes/home.tsx";
import { AboutPage } from "@/routes/about.tsx";
import { NotFoundPage } from "@/routes/404.tsx";
import { ProductPage } from "@/routes/products/[slug].tsx";
import { CartPage } from "@/routes/cart.tsx";

function Logo() {
  return <i className="iconoir-spark-solid text-2xl text-indigo-500" />;
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={(active) =>
        `text-sm font-medium ${
          active ? "text-gray-900" : "text-gray-500 hover:text-gray-900"
        }`
      }
    >
      {children}
    </Link>
  );
}

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white py-1.5">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 hover:bg-neutral-200/50 rounded-md p-1"
        >
          <Logo />
        </Link>

        <div className="flex items-center gap-8">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/about">About</NavLink>
        </div>

        <Link
          href="/cart"
          className="relative flex items-center hover:bg-neutral-200/50 rounded-md p-1"
        >
          <i className="iconoir-cart text-xl" />
          <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-gray-900 text-[10px] font-semibold text-white">
            7
          </span>
        </Link>
      </div>
    </nav>
  );
}

export function App() {
  return (
    <div className="min-h-screen bg-white pt-12">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-28">
        <Switch>
          <Route path="/">
            <HomePage />
          </Route>

          <Route path="/about">
            <AboutPage />
          </Route>

          <Route path="/products/:slug">
            {(params) => <ProductPage slug={params.slug} />}
          </Route>

          <Route path="/cart">
            <CartPage />
          </Route>

          <Route path="/featured">
            <Redirect to="/products/hook-keyring-rvst" />
          </Route>

          <Route>
            <NotFoundPage />
          </Route>
        </Switch>
      </main>
    </div>
  );
}
