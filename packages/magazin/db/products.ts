export interface Product {
  slug: string;
  name: string;
  price: number;
  brand: string;
  category: string;
  image: string;
  description: string;
}

export const products: Product[] = [
  {
    image: "/products/carabiner.webp",
    slug: "hook-keyring-rvst",
    brand: "RVST",
    category: "Accessories",
    name: "Hook Keyring",
    price: 65,
    description:
      "Premium carabiner keyring crafted with attention to detail and designed for everyday carry.",
  },
  {
    image: "/products/ring.webp",
    slug: "silver-ok-ring",
    brand: "Rick Woens",
    category: "Jewelry",
    name: "Silver OK Ring",
    price: 99,
    description:
      "Handcrafted sterling silver ring with a unique OK gesture design.",
  },
  {
    image: "/products/navigator-cap.webp",
    slug: "navigator-baseball-cap",
    brand: "Rendr",
    category: "Accessories",
    name: "Navigator Baseball Cap",
    price: 179,
    description:
      "Premium baseball cap with embroidered branding and adjustable fit.",
  },
  {
    image: "/products/sizelimited-tshirt.webp",
    slug: "size-limited-tshirt",
    brand: "Rendr",
    category: "Clothing",
    name: "Size Limited T-Shirt",
    price: 65,
    description:
      "Comfortable cotton t-shirt with minimalist branding and premium fit.",
  },
  {
    image: "/products/wouter-glasses.webp",
    slug: "wouter-cult-glasses",
    brand: "Wouter",
    category: "Accessories",
    name: "Wouter Glasses",
    price: 129,
    description:
      "Cult glasses worn by wouter. Minimalist design with premium frames and crystal-clear lenses.",
  },
  {
    image: "/products/parka.webp",
    slug: "route-breaker-windbreaker",
    brand: "Wouter",
    category: "Clothing",
    name: "Route Breaker Windbreaker",
    price: 249,
    description:
      "Navigate any weather with the Route Breaker. Lightweight, water-resistant, and built for those who hook into adventure.",
  },
  {
    image: "/products/react-pendant.webp",
    slug: "react-state-pendant",
    brand: "Wouter",
    category: "Jewelry",
    name: "React State Pendant",
    price: 159,
    description:
      "A declarative pendant for those who embrace the component lifecycle. Hooks perfectly with any chain.",
  },
  {
    image: "/products/scarf.webp",
    slug: "nested-routes-silk-scarf",
    brand: "Wouter",
    category: "Accessories",
    name: "Nested Routes Silk Scarf",
    price: 189,
    description:
      "Luxurious silk scarf featuring an intricate wouter pattern. Each layer wraps seamlessly into the next, just like your favorite routes.",
  },
  {
    image: "/products/poster-a.webp",
    slug: "keep-routing-poster",
    brand: "Wouter",
    category: "Art",
    name: "Keep Routing Poster",
    price: 45,
    description:
      "Minimalist poster with a bold message for developers. Museum-quality print that reminds you to stay on the path.",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
