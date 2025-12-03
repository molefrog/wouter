import { useEffect, useState } from "react";
import { useLocation } from "wouter";

const cartItems = [
  { id: 1, name: "Studio Display", price: "$1,599", quantity: 2 },
  { id: 2, name: "Magic Keyboard", price: "$199", quantity: 1 },
  { id: 3, name: "Magic Mouse", price: "$99", quantity: 3 },
  { id: 4, name: "USB-C Cable", price: "$29", quantity: 2 },
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
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-6">
        Shopping Cart
      </h1>

      <div className="space-y-3">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between border-b border-gray-100 pb-4"
          >
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-stone-100 rounded-md shrink-0" />
              <div className="flex flex-col">
                <span className="text-neutral-900">{item.name}</span>
                <span className="text-sm text-gray-500 mt-1">
                  {item.quantity} × {item.price}
                </span>
              </div>
            </div>
            <span className="text-neutral-900 text-sm">{item.price}</span>
          </div>
        ))}
      </div>

      <div className="text-right mt-4">
        <div className="text-sm text-right text-neutral-500">Total</div>
        <div className="text-base font-semibold text-neutral-900">$1,926</div>
      </div>

      <NotificationBanner show={showNotification} message={addedItem} />
    </>
  );
}
