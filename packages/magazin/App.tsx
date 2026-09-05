import { useState } from "react";
import { Route, Switch, Redirect } from "wouter";
import { Helmet } from "@dr.pogodin/react-helmet";
import { HomePage } from "@/routes/home.tsx";
import { AboutPage } from "@/routes/about.tsx";
import { NotFoundPage } from "@/routes/404.tsx";
import { ProductPage } from "@/routes/products/[slug].tsx";
import { CartPage, type CartItem } from "@/routes/cart.tsx";
import { WithStatusCode } from "@/components/with-status-code.tsx";
import { Navbar } from "@/components/navbar.tsx";
import { Footer } from "@/components/footer.tsx";
import { products, type Product } from "@/db/products.ts";

const initialCartItems: CartItem[] = [
  { product: products[4]!, quantity: 1 },
  { product: products[5]!, quantity: 1 },
  { product: products[0]!, quantity: 2 },
  { product: products[7]!, quantity: 3 },
];

export function App() {
  const [cartItems, setCartItems] = useState(initialCartItems);

  const addToCart = (product: Product) => {
    setCartItems((items) => {
      const existingItem = items.find(
        (item) => item.product.slug === product.slug
      );

      if (!existingItem) {
        return [...items, { product, quantity: 1 }];
      }

      return items.map((item) =>
        item.product.slug === product.slug
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    });
  };

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Helmet titleTemplate="%s · Magazin by wouter" />

      <Navbar cartCount={cartCount} />

      <div className="min-h-[85vh] pt-12">
        <main className="max-w-4xl mx-auto px-6 py-28">
          <Switch>
            <Route path="/">
              <HomePage />
            </Route>

            <Route path="/about">
              <AboutPage />
            </Route>

            <Route path="/products/:slug">
              {(params) => (
                <ProductPage slug={params.slug} onAddToCart={addToCart} />
              )}
            </Route>

            <Route path="/cart">
              <CartPage items={cartItems} />
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

      <Footer />
    </div>
  );
}
