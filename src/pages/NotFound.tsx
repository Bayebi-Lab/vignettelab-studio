import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center py-24">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="font-serif text-8xl text-primary mb-4">404</h1>
          <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-4">
            Page Not Found
          </h2>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
          <Button variant="hero" size="lg" asChild>
            <Link to="/">
              <Home size={18} />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
