import timelessPackageImage from "@/assets/timeless_package_image.png";
import radiancePackageImage from "@/assets/radiance_package_image.png";
import eternalPackageImage from "@/assets/eternal_package_image.png";

const PACKAGE_IMAGES: Record<string, string> = {
  "timeless-glow": timelessPackageImage,
  "radiance-collection": radiancePackageImage,
  "eternal-moments": eternalPackageImage,
};

export function getPackageImage(slug: string): string {
  return PACKAGE_IMAGES[slug] ?? timelessPackageImage;
}
