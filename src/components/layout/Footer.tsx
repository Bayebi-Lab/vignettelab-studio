import { Link } from "react-router-dom";
import { Instagram, Heart } from "lucide-react";

const footerLinks = {
  explore: [
    { label: "Portrait Packages", href: "/shop" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "FAQ", href: "/faq" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Contact Us", href: "/contact" },
  ],
};

function FacebookIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function PinterestIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

const socialLinks = [
  { icon: Instagram, href: "https://www.instagram.com/vignettelabstudio?igsh=bjhtdzlrZXg1eGhv", label: "Instagram" },
  { icon: FacebookIcon, href: "https://www.facebook.com/vignettelabstudio", label: "Facebook" },
  { icon: PinterestIcon, href: "https://www.pinterest.com/vignettelabstudio", label: "Pinterest" },
];

const linkBase =
  "text-muted-foreground hover:text-primary text-sm transition-colors py-2 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-cream-dark rounded";

export function Footer() {
  return (
    <footer className="bg-cream-dark border-t border-border">
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-10 lg:gap-16">
          {/* Brand */}
          <div className="max-w-sm">
            <Link
              to="/"
              className="inline-flex items-baseline gap-2 mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-cream-dark rounded"
            >
              <span className="font-serif text-2xl font-semibold text-foreground">
                Vignette<span className="text-primary">Lab</span>
              </span>
              <span className="font-sans text-xs font-normal text-muted-foreground tracking-wider -translate-y-0.5">
                STUDIO
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Stunning Maternity Portraits, Right From Home. Celebrate your pregnancy glow with studio-quality portraits, effortlessly created from your photos and delivered in 24 hours or less.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow us on ${social.label}`}
                  className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-cream-dark"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col sm:flex-row gap-10 sm:gap-16">
            <div>
              <h4 className="font-serif text-base font-medium text-foreground mb-1">Explore</h4>
              <ul className="space-y-0">
                {footerLinks.explore.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className={linkBase}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-serif text-base font-medium text-foreground mb-1">Legal</h4>
              <ul className="space-y-0">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className={linkBase}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 lg:mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} VignetteLab Studio. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-1">
            Made with <Heart size={14} className="text-primary fill-primary" aria-hidden /> for expecting mothers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}