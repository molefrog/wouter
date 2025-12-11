import { useSearchParams, Link } from "wouter";
import { Helmet } from "@dr.pogodin/react-helmet";
import { products, type Product } from "@/db/products";

function ProductCard({ slug, brand, category, name, price, image }: Product) {
  return (
    <Link
      href={`/products/${slug}`}
      transition
      className="overflow-hidden group"
    >
      <div
        className="aspect-square p-12 bg-stone-100/75 group-hover:bg-stone-200/75 transition-colors rounded-t-lg"
        style={{ viewTransitionName: `product-image-${slug}` }}
      >
        <img src={image} alt={name} className="object-cover w-full h-full" />
      </div>
      <div className="p-4 bg-stone-100/75 rounded-b-lg group-hover:bg-stone-200/75 transition-colors">
        <div className="text-sm text-neutral-400/75">
          {brand} · {category}
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="font-medium text-sm">{name}</span>
          <span className="">${price.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  );
}

const categories = [
  { value: "all", label: "All" },
  { value: "accessories", label: "Accessories" },
  { value: "clothing", label: "Clothing" },
  { value: "jewelry", label: "Jewelry" },
  { value: "art", label: "Art" },
];

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name" },
];

function CategoryFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-4">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`text-sm cursor-pointer ${
            value === cat.value
              ? "text-neutral-900 underline underline-offset-4"
              : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}

function SortSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative inline-flex items-center cursor-pointer">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-transparent text-sm text-neutral-500 pr-4 cursor-pointer hover:text-neutral-900 focus:outline-none text-right"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <i className="iconoir-nav-arrow-down absolute right-0 text-xs pointer-events-none text-neutral-500 cursor-pointer ml-1" />
    </div>
  );
}

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "all";
  const sort = searchParams.get("sort") || "newest";

  const handleFilterChange = (key: string, value: string) => {
    setSearchParams((params) => {
      const newParams = new URLSearchParams(params);
      if (value === "all" || value === "newest") {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
      return newParams;
    });
  };

  // Filter products by category
  let filteredProducts = products;
  if (category !== "all") {
    filteredProducts = products.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sort) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "name":
        return a.name.localeCompare(b.name);
      case "newest":
      default:
        return 0; // Keep original order
    }
  });

  return (
    <>
      <Helmet>
        <title>Magazin by wouter</title>
      </Helmet>

      <div className="mb-20">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-2">
          Welcome to our shop
        </h1>
        <p className="text-lg text-neutral-500 mb-4 max-w-2xl text-pretty">
          Exclusive merch for hardcore wouter fans. You can't buy these yet, so
          go star the repo to increase our chances of becoming a billion dollar
          company.
        </p>
        <button
          onClick={() =>
            document
              .getElementById("products")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          className="bg-black text-white px-3 text-sm font-medium py-2 rounded-xl hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer"
        >
          Start shopping →
        </button>
      </div>

      <div
        className="flex items-center justify-between py-6 scroll-mt-16"
        id="products"
      >
        <CategoryFilter
          value={category}
          onChange={(v) => handleFilterChange("category", v)}
        />
        <SortSelect
          value={sort}
          onChange={(v) => handleFilterChange("sort", v)}
        />
      </div>

      <div className="grid grid-cols-3 auto-rows-fr gap-2.5">
        {sortedProducts.map((product) => (
          <ProductCard key={product.slug} {...product} />
        ))}
      </div>

      {sortedProducts.length === 0 && (
        <div className="text-center py-12 text-neutral-500">
          No products found in this category.
        </div>
      )}
    </>
  );
}
