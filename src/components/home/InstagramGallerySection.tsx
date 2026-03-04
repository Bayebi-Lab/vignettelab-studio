import { useState } from "react";
import { motion } from "framer-motion";
import { Instagram, Play } from "lucide-react";
import { useInstagramMedia } from "@/hooks/useInstagramMedia";
import { useInstagramPosts } from "@/hooks/useInstagramPosts";
import type { InstagramPost } from "@/hooks/useInstagramPosts";
import type { InstagramMediaItem } from "@/hooks/useInstagramMedia";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

const INSTAGRAM_PROFILE_URL = "https://www.instagram.com/vignettelabstudio?igsh=bjhtdzlrZXg1eGhv";

function parseCaptionLinks(caption: string | undefined): React.ReactNode {
  if (!caption) return null;
  const parts = caption.split(/(@[\w.]+|#[\w]+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("@")) {
      return (
        <a
          key={i}
          href={`https://instagram.com/${part.slice(1)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {part}
        </a>
      );
    }
    if (part.startsWith("#")) {
      return (
        <a
          key={i}
          href={`https://instagram.com/explore/tags/${part.slice(1)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

function CurrentInstagramSection({
  media,
  loading,
  error,
}: {
  media: InstagramMediaItem[];
  loading: boolean;
  error: string | null;
}) {
  return (
    <>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 lg:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-xl bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : error || media.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 rounded-2xl bg-background/50 border border-border"
        >
          <Instagram className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="font-serif text-xl text-foreground mb-2">
            Follow Us on Instagram
          </h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
            Get inspired by real maternity portraits and behind-the-scenes from our community.
          </p>
          <Button variant="outline" size="lg" asChild>
            <a href={INSTAGRAM_PROFILE_URL} target="_blank" rel="noopener noreferrer">
              <Instagram size={18} className="mr-2" />
              Follow @vignettelabstudio
            </a>
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 lg:gap-4">
          {media.map((item, index) => {
            const imageUrl = item.thumbnail_url || item.media_url;
            if (!imageUrl) return null;

            return (
              <motion.a
                key={item.id}
                href={item.permalink || INSTAGRAM_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group relative aspect-square rounded-xl overflow-hidden"
              >
                <img
                  src={imageUrl}
                  alt={item.caption?.slice(0, 100) ?? "Instagram post"}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/40 transition-colors duration-300 flex items-center justify-center">
                  <Instagram
                    size={28}
                    className="text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </motion.a>
            );
          })}
        </div>
      )}

      {!loading && media.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <Button variant="outline" size="lg" asChild>
            <a href={INSTAGRAM_PROFILE_URL} target="_blank" rel="noopener noreferrer">
              <Instagram size={18} className="mr-2" />
              Follow @vignettelabstudio
            </a>
          </Button>
        </motion.div>
      )}
    </>
  );
}

function NewInstagramSection({ posts }: { posts: InstagramPost[] }) {
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);

  return (
    <>
      <div className="relative px-14">
        <Carousel
          opts={{
            align: "start",
            loop: false,
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {posts.map((post) => (
              <CarouselItem
                key={post.id}
                className="pl-4 min-w-[280px] max-w-[280px] basis-[280px] shrink-0 md:min-w-[320px] md:max-w-[320px] md:basis-[320px]"
              >
                <button
                  type="button"
                  onClick={() => setSelectedPost(post)}
                  className="group relative aspect-square rounded-xl overflow-hidden w-full block text-left"
                >
                  <img
                    src={post.image_url}
                    alt={post.caption?.slice(0, 100) ?? "Instagram post"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="eager"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/40 transition-colors duration-300 flex items-center justify-center">
                    <Instagram
                      size={28}
                      className="text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  {post.media_type === "VIDEO" && (
                    <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
                      <Play className="w-5 h-5 text-white fill-white" />
                    </div>
                  )}
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-12 top-1/2 -translate-y-1/2 z-10" />
          <CarouselNext className="-right-12 top-1/2 -translate-y-1/2 z-10" />
        </Carousel>
      </div>

      <div className="text-center mt-8">
        <Button variant="outline" size="lg" asChild>
          <a href={INSTAGRAM_PROFILE_URL} target="_blank" rel="noopener noreferrer">
            <Instagram size={18} className="mr-2" />
            Follow @vignettelabstudio
          </a>
        </Button>
      </div>

      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden flex flex-col md:flex-row gap-0">
          {selectedPost && (
            <>
              <div className="flex-1 min-w-0 aspect-square md:aspect-auto md:min-h-[400px]">
                <img
                  src={selectedPost.image_url}
                  alt={selectedPost.caption?.slice(0, 100) ?? "Instagram post"}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              <div className="flex-1 p-6 flex flex-col min-w-0">
                <a
                  href={INSTAGRAM_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 mb-4 text-foreground hover:opacity-80 transition-opacity"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888] flex items-center justify-center">
                    <Instagram className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold">vignettelabstudio</span>
                </a>
                <div className="text-sm text-muted-foreground flex-1 overflow-y-auto mb-4">
                  {parseCaptionLinks(selectedPost.caption)}
                </div>
                <Button asChild>
                  <a
                    href={selectedPost.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Instagram
                  </a>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export function InstagramGallerySection() {
  const { posts, loading: postsLoading } = useInstagramPosts();
  const { media, loading: mediaLoading, error } = useInstagramMedia();

  return (
    <section className="py-24 bg-cream-dark">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-widest mb-4 block">
            Community
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
            Instagram Moments
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real maternity portraits from our community. Follow us for inspiration and share your glow.
          </p>
        </motion.div>

        {postsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 lg:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-xl bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <NewInstagramSection posts={posts} />
        ) : (
          <CurrentInstagramSection media={media} loading={mediaLoading} error={error} />
        )}
      </div>
    </section>
  );
}
