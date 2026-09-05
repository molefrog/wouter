import { useSearchParams, Link } from "wouter";
import { Helmet } from "@dr.pogodin/react-helmet";
import { products, type Product } from "@/db/products";
import { StarWouter } from "@/components/star-wouter";

function ProductCard({ slug, brand, category, name, price, image }: Product) {
  return (
    <Link
      href={`/products/${slug}`}
      transition
      className="overflow-hidden group flex flex-col h-full"
    >
      <div
        className="w-full aspect-square p-12 bg-stone-100/75 group-hover:bg-stone-200/75 transition-colors rounded-t-lg"
        style={{ viewTransitionName: `product-image-${slug}` }}
      >
        <img src={image} alt={name} className="object-contain w-full h-full" />
      </div>
      <div className="p-4 bg-stone-100/75 rounded-b-lg group-hover:bg-stone-200/75 transition-colors flex-1 flex flex-col justify-between">
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
    <div
      className="flex items-center gap-4"
      role="group"
      aria-label="Filter products by category"
    >
      {categories.map((cat) => (
        <button
          type="button"
          key={cat.value}
          aria-pressed={value === cat.value}
          onClick={() => onChange(cat.value)}
          className={`rounded-sm text-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 ${
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
    <div className="relative flex md:inline-flex items-center cursor-pointer w-full md:w-auto">
      <select
        aria-label="Sort products"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-sm bg-transparent text-sm text-neutral-500 pr-4 cursor-pointer hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 text-left md:text-right w-full md:w-auto"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <i
        aria-hidden="true"
        className="iconoir-nav-arrow-down absolute right-0 text-xs pointer-events-none text-neutral-500 cursor-pointer ml-1"
      />
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
        <div className="flex items-center gap-3 overflow-x-auto flex-nowrap -mx-6 px-6 md:mx-0 md:px-0">
          <button
            onClick={() =>
              document
                .getElementById("products")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="bg-black text-white px-3 text-sm font-medium py-2 rounded-xl hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer whitespace-nowrap flex-shrink-0"
          >
            Start shopping →
          </button>
          <StarWouter />
        </div>
      </div>

      <div
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-6 scroll-mt-16"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 auto-rows-max gap-2.5">
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
