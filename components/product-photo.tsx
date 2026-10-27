import Image from "next/image";
import type { ProductImage } from "@/lib/types";

/**
 * A product photo that fills its positioned parent. Photos shot on plain white or black
 * (`tone` in data/store.json) sit on a stage in the site's colors and the backdrop blends
 * into it; other photos are shown as they are.
 */
export function ProductPhoto({
  image,
  sizes,
  priority,
  className = "",
}: {
  image: ProductImage;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (!image.tone) {
    return <Image src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} className={`object-cover ${className}`} />;
  }
  const blend = image.tone === "light" ? "mix-blend-multiply" : "mix-blend-screen";
  return (
    <div className={`photo-stage photo-stage--${image.tone} absolute inset-0 isolate`}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-contain p-[7%] ${blend} ${className}`}
      />
    </div>
  );
}
