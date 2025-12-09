import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Helmet } from "@dr.pogodin/react-helmet";
import { products, type Product } from "@/db/products";

const cartItems: Array<{ product: Product; quantity: number }> = [
  { product: products[4]!, quantity: 1 }, // Wouter Glasses
  { product: products[5]!, quantity: 1 }, // Route Breaker Windbreaker
  { product: products[0]!, quantity: 2 }, // Hook Keyring
  { product: products[7]!, quantity: 3 }, // Keep Routing Poster
];

function NotificationBanner({
  show,
  message,
}: {
  show: boolean;
  message: string | null;
}) {
  if (!message) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border border-neutral-200 text-neutral-900 px-3.5 py-2 rounded-lg shadow-lg transition-transform duration-300 starting:translate-y-32 ${
        show ? "translate-y-0" : "translate-y-32"
      }`}
    >
      <div className="flex items-center gap-2">
        <i className="iconoir-shopping-bag-plus text-lg" />
        <span className="text-sm font-medium">{message} added to cart</span>
      </div>
    </div>
  );
}

export function CartPage() {
  const [location, navigate] = useLocation();
  const [showNotification, setShowNotification] = useState(false);
  const [addedItem, setAddedItem] = useState<string | null>(null);

  useEffect(() => {
    const state = history.state as { addedItem?: string } | null;
    if (state?.addedItem) {
      setAddedItem(state.addedItem);
      setShowNotification(true);

      // Clear the state so it doesn't show again on refresh
      navigate(location, { replace: true, state: null });

      // Hide notification after 3 seconds
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  return (
    <>
      <Helmet>
        <title>Cart</title>
      </Helmet>

      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-6">
        Shopping Cart
      </h1>

      <div className="space-y-3">
        {cartItems.map((item, index) => (
          <div
            key={index}
            className="flex items-start justify-between border-b border-gray-100 pb-4"
          >
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-stone-100 rounded-md shrink-0 p-2">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-neutral-900">{item.product.name}</span>
                <span className="text-sm text-gray-500 mt-1">
                  {item.quantity} × ${item.product.price}
                </span>
              </div>
            </div>
            <span className="text-neutral-900 text-sm">
              ${item.product.price}
            </span>
          </div>
        ))}
      </div>

      <div className="text-right mt-4">
        <div className="text-sm text-right text-neutral-500">Total</div>
        <div className="text-base font-semibold text-neutral-900">$643</div>
      </div>

      <NotificationBanner show={showNotification} message={addedItem} />
    </>
  );
}
