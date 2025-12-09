import { Route, Switch, Redirect } from "wouter";
import { Helmet } from "@dr.pogodin/react-helmet";
import { HomePage } from "@/routes/home.tsx";
import { AboutPage } from "@/routes/about.tsx";
import { NotFoundPage } from "@/routes/404.tsx";
import { ProductPage } from "@/routes/products/[slug].tsx";
import { CartPage } from "@/routes/cart.tsx";
import { WithStatusCode } from "@/components/with-status-code.tsx";
import { Navbar } from "@/components/navbar.tsx";

export function App() {
  return (
    <div className="min-h-screen bg-white pt-12">
      <Helmet titleTemplate="%s · Magazin by wouter" />

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
            <WithStatusCode code={404}>
              <NotFoundPage />
            </WithStatusCode>
          </Route>
        </Switch>
      </main>
    </div>
  );
}
