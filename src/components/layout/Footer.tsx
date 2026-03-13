import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

function InstagramIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.766 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

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

const socialLinks = [
  { icon: InstagramIcon, href: "https://www.instagram.com/vignettelabstudio?igsh=bjhtdzlrZXg1eGhv", label: "Instagram" },
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