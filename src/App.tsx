import { useEffect, Suspense, lazy } from "react";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CustomCursor from "@/components/CustomCursor";
import PageTransition from "@/components/PageTransition";
import { useSeo } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";

const Index = lazy(() => import("./pages/Index"));
const Collections = lazy(() => import("./pages/Collections"));
const CollectionDetail = lazy(() => import("./pages/CollectionDetail"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Philosophy = lazy(() => import("./pages/Philosophy"));
const Consultancy = lazy(() => import("./pages/Consultancy"));
const Cart = lazy(() => import("./pages/Cart"));
const Auth = lazy(() => import("./pages/Auth"));
const Account = lazy(() => import("./pages/Account"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const Admin = lazy(() => import("./pages/Admin"));
const CRM = lazy(() => import("./pages/CRM"));
const Policies = lazy(() => import("./pages/Policies"));
const Blogs = lazy(() => import("./pages/CaseStudies"));
const NotFound = lazy(() => import("./pages/NotFound"));
const LaunchCountdown = lazy(() => import("./pages/LaunchCountdown"));

const isLaunchGateEnabled = import.meta.env.VITE_LAUNCH_GATE_ENABLED === "true";

const queryClient = new QueryClient();

const routeSeo = (pathname: string) => {
  if (pathname === "/") {
    return {
      title: "Babel Designs | Muted Luxury Furniture",
      description: "Babel Designs creates concept-driven furniture collections in stone, wood, and metal for refined spaces.",
      canonicalPath: "/",
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Babel Designs",
        url: typeof window !== "undefined" ? window.location.origin : "",
        slogan: "Design that unites all diversities",
      },
    };
  }

  if (pathname === "/collections") {
    return {
      title: "Collections | Babel Designs",
      description: "Explore the Monolith, Stillness, and Origin collections by Babel Designs.",
      canonicalPath: "/collections",
    };
  }

  if (pathname.startsWith("/collections/")) {
    return {
      title: "Collection Details | Babel Designs",
      description: "Discover signature pieces and design philosophy for this collection.",
      canonicalPath: pathname,
    };
  }

  if (pathname.startsWith("/product/")) {
    return {
      title: "Product Details | Babel Designs",
      description: "View product materials, dimensions, and philosophy from Babel Designs.",
      canonicalPath: pathname,
    };
  }

  if (pathname === "/consultancy") {
    return {
      title: "Consultancy | Babel Designs",
      description: "Book a design consultancy to create bespoke furniture solutions for your space.",
      canonicalPath: pathname,
    };
  }

  if (pathname === "/philosophy") {
    return {
      title: "Philosophy | Babel Designs",
      description: "Read the Babel Designs philosophy on timeless form, material truth, and universal design language.",
      canonicalPath: pathname,
    };
  }

  if (pathname === "/cart") {
    return {
      title: "Cart | Babel Designs",
      description: "Review your cart and proceed to secure checkout.",
      canonicalPath: pathname,
    };
  }

  if (pathname === "/auth") {
    return {
      title: "Account | Babel Designs",
      description: "Sign in to your Babel Designs account using secure OAuth.",
      canonicalPath: pathname,
      noIndex: true,
    };
  }

  if (pathname === "/account") {
    return {
      title: "My Account | Babel Designs",
      description: "Manage your Babel Designs profile and account details.",
      canonicalPath: pathname,
      noIndex: true,
    };
  }

  if (pathname === "/policies") {
    return {
      title: "Policies | Babel Designs",
      description: "Read delivery, return, and warranty policies for Babel Designs orders.",
      canonicalPath: pathname,
    };
  }

  if (pathname === "/blogs") {
    return {
      title: "Blogs | Babel Designs",
      description: "Read stories, notes, and project insights from Babel Designs.",
      canonicalPath: pathname,
    };
  }

  if (pathname.startsWith("/order/success/")) {
    return {
      title: "Order Confirmed | Babel Designs",
      description: "Your payment was successful. Review your order reference.",
      canonicalPath: pathname,
      noIndex: true,
    };
  }

  if (pathname === "/admin") {
    return {
      title: "Admin Dashboard | Babel Designs",
      description: "Overview of orders, consultancy requests, and subscribers.",
      canonicalPath: pathname,
      noIndex: true,
    };
  }

  if (pathname === "/crm") {
    return {
      title: "Lead CRM | Babel Designs",
      description: "Internal lead management dashboard.",
      canonicalPath: pathname,
      noIndex: true,
    };
  }

  return {
    title: "Page Not Found | Babel Designs",
    description: "The page you requested could not be found.",
    canonicalPath: pathname,
    noIndex: true,
  };
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
};

const LoadingShell = () => (
  <div className="container-editorial py-24">
    <div className="h-8 w-48 animate-pulse bg-muted" />
    <div className="mt-4 h-4 w-80 animate-pulse bg-muted" />
  </div>
);

const swipeRoutes = ["/", "/collections", "/philosophy", "/consultancy"];

const MobileSwipeNavigator = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isMobile = () => window.matchMedia("(max-width: 767px)").matches;
    let startX = 0;
    let startY = 0;
    let tracking = false;
    let swipeLocked = false;

    const onTouchStart = (event: TouchEvent) => {
      if (!isMobile() || event.touches.length !== 1) return;

      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          "input, textarea, select, button, a, [data-swipe-lock='true'], [data-carousel='true'], .lookbook-snap",
        )
      ) {
        swipeLocked = true;
        tracking = false;
        return;
      }

      const touch = event.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      tracking = true;
      swipeLocked = false;
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (!tracking || swipeLocked || !isMobile() || event.changedTouches.length !== 1) return;
      tracking = false;

      const currentPath = location.pathname;
      const routeIndex = swipeRoutes.indexOf(currentPath);
      if (routeIndex === -1) return;

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;

      const passesThreshold = Math.abs(deltaX) > 70 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2;
      if (!passesThreshold) return;

      if (deltaX < 0 && routeIndex < swipeRoutes.length - 1) {
        navigate(swipeRoutes[routeIndex + 1]);
      } else if (deltaX > 0 && routeIndex > 0) {
        navigate(swipeRoutes[routeIndex - 1]);
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [location.pathname, navigate]);

  return null;
};

const AppContent = () => {
  const location = useLocation();
  const seo = isLaunchGateEnabled
    ? {
        title: "Babel Designs | Launch Countdown",
        description: "Babel Designs is preparing a new launch experience. Countdown to January 1, 2027.",
        canonicalPath: "/",
        noIndex: true,
      }
    : routeSeo(location.pathname);

  useSeo(seo);

  useEffect(() => {
    trackEvent({ event: "page_view", path: location.pathname });
  }, [location.pathname]);

  if (isLaunchGateEnabled) {
    return (
      <div className="site-grain">
        <Suspense fallback={<LoadingShell />}>
          <LaunchCountdown />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="site-grain">
      <ScrollToTop />
      <MobileSwipeNavigator />
      <CustomCursor />
      <Navbar />
      <main>
        <AnimatePresence mode="wait">
          <PageTransition pathname={location.pathname}>
            <Suspense fallback={<LoadingShell />}>
              <Routes location={location}>
                <Route path="/" element={<Index />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/collections/:slug" element={<CollectionDetail />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/philosophy" element={<Philosophy />} />
                <Route path="/consultancy" element={<Consultancy />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/account" element={<Account />} />
                <Route path="/order/success/:orderId" element={<OrderSuccess />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/crm" element={<CRM />} />
                <Route path="/policies" element={<Policies />} />
                <Route path="/blogs" element={<Blogs />} />
                <Route path="/case-studies" element={<Blogs />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
