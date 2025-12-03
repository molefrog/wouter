import { useSearch, Link } from "wouter";
import { navigate } from "wouter/use-browser-location";

type ProductProps = {
  slug: string;
  brand: string;
  category: string;
  name: string;
  price: number;
};

function Product({ slug, brand, category, name, price }: ProductProps) {
  return (
    <Link
      href={`/products/${slug}`}
      className="rounded-lg bg-stone-100/75 overflow-hidden hover:bg-stone-200/75 transition-colors"
    >
      <div className="aspect-square" />
      <div className="p-4">
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

const products: ProductProps[] = [
  {
    slug: "studio-display",
    brand: "Apple",
    category: "Tech",
    name: "Studio Display",
    price: 1599,
  },
  {
    slug: "wh-1000xm5",
    brand: "Sony",
    category: "Audio",
    name: "WH-1000XM5",
    price: 349,
  },
  {
    slug: "v15-detect",
    brand: "Dyson",
    category: "Home",
    name: "V15 Detect",
    price: 749,
  },
  {
    slug: "macbook-pro",
    brand: "Apple",
    category: "Tech",
    name: "MacBook Pro",
    price: 2499,
  },
  {
    slug: "aeron-chair",
    brand: "Herman Miller",
    category: "Furniture",
    name: "Aeron Chair",
    price: 1395,
  },
  {
    slug: "quietcomfort-ultra",
    brand: "Bose",
    category: "Audio",
    name: "QuietComfort Ultra",
    price: 429,
  },
];

const categories = [
  { value: "all", label: "All" },
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "books", label: "Books" },
];

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
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
      <div className="mb-20">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-2">
          Welcome to our shop
        </h1>
        <p className="text-lg text-neutral-500 mb-4 max-w-xl text-pretty">
          Discover our carefully curated collection of premium products, crafted
          with attention to detail and designed to enhance your everyday life
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
        {products.map((product, i) => (
          <Product key={i} {...product} />
        ))}
      </div>
    </>
  );
}
