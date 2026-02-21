import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import { useInstagramMedia } from "@/hooks/useInstagramMedia";
import { Button } from "@/components/ui/button";

const INSTAGRAM_PROFILE_URL = "https://www.instagram.com/vignettelabstudio?igsh=bjhtdzlrZXg1eGhv";

export function InstagramGallerySection() {
  const { media, loading, error } = useInstagramMedia();

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
            From Our Instagram
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real maternity portraits from our community. Follow us for inspiration and share your glow.
          </p>
        </motion.div>

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
      </div>
    </section>
  );
}
