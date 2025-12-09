import { Link } from "wouter";
import { Helmet } from "@dr.pogodin/react-helmet";
import { getProductBySlug } from "@/db/products";

export function ProductPage({ slug }: { slug: string }) {
  const product = getProductBySlug(slug);

  if (!product) {
    return (
      <div className="text-center py-12">
        <Helmet>
          <title>Product Not Found</title>
        </Helmet>
        <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
          Product not found
        </h1>
        <Link href="/" className="text-sm text-neutral-500 hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{product.name}</title>
      </Helmet>
      <Link
        href="/"
        className=" inline-flex items-center gap-2  hover:bg-neutral-100/75 rounded-md p-1.5 hover:text-neutral-900 mb-2"
      >
        <i className="iconoir-reply text-base" />
      </Link>
      <div className="grid grid-cols-3 gap-12">
        <div className="bg-stone-100/75 rounded-lg aspect-square col-span-2 p-12">
          <img
            src={product.image}
            alt={product.name}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="pt-4">
          <div className="text-sm text-neutral-400 mb-2">
            {product.brand} · {product.category}
          </div>
          <h1 className="text-xl tracking-tight text-neutral-900 mb-2">
            {product.name}
          </h1>
          <p className="text-neutral-500 text-sm">{product.description}</p>

          <div className="mt-4">
            <span className="text-sm">${product.price}</span>
          </div>
          <div className="mt-8">
            <Link
              href="/cart"
              state={{ addedItem: product.name }}
              className="bg-black text-white px-3 text-sm font-medium py-2 rounded-xl hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer w-full inline-block text-center"
            >
              Add to Cart
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
