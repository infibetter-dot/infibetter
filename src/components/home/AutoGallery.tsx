import { Link } from "@tanstack/react-router";



interface Product {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
}

interface Props {
  products: Product[];
}

export default function AutoGallery({ products }: Props) {
  if (!products.length) return null;

  const items = [...products, ...products];

  return (
    <section className="overflow-hidden bg-transparent py-0">

      <div className="container-x mb-12 text-center">

        <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
          OLIVE LIVING
        </p>

        <h2 className="mt-4 font-display text-5xl">
          Discover Our Collection
        </h2>

      </div>

      <div className="gallery-wrapper">

        <div className="gallery-track">

          {items.map((product, index) => (

            <Link
              key={`${product.id}-${index}`}
              to="/products/$slug"
              params={{ slug: product.slug }}
              className="gallery-item group"
            >

              <img
  src={product.image_url || "/placeholder.svg"}
  alt={product.name}
  className="aspect-square w-full object-cover transition duration-700 group-hover:scale-105"
/>

            </Link>

          ))}

        </div>

      </div>

    </section>
  );
}