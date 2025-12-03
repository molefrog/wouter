import { Link } from "wouter";

export function ProductPage({ slug }: { slug: string }) {
  const name = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <>
      <Link
        href="/"
        className=" inline-flex items-center gap-2  hover:bg-neutral-100/75 rounded-md p-1.5 hover:text-neutral-900 mb-2"
      >
        <i className="iconoir-reply text-base" />
      </Link>
      <div className="grid grid-cols-3 gap-12">
        <div className="bg-stone-100/75 rounded-lg aspect-square col-span-2" />
        <div className="pt-4">
          <h1 className="text-xl tracking-tight text-neutral-900 mb-2">
            {name}
          </h1>
          <p className="text-neutral-500 text-sm">
            Premium quality product crafted with attention to detail and
            designed to enhance your everyday life.
          </p>

          <div className="mt-4">
            <span className="text-sm">$199.99</span>
          </div>
          <div className="mt-8">
            <button className="bg-black text-white px-3 text-sm font-medium py-2 rounded-xl hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer w-full">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
