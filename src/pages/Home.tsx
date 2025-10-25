import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Zap, HeadphonesIcon, CheckCircle2, Award } from "lucide-react";
import ListingCard from "@/components/ListingCard";
import VerifiedTag from "@/components/VerifiedTag";
import LegalDisclaimer from "@/components/LegalDisclaimer";
import SuccessStoriesCarousel from "@/components/SuccessStoriesCarousel";
import heroImage from "@/assets/hero-bg.jpg";
import { mockListings } from "@/data/mockData";

const Home = () => {
  const featuredListings = mockListings.slice(0, 3);

  const steps = [
    {
      icon: Shield,
      title: "Seller Lists & Verifies",
      description: "Sellers submit their Battle Royale account details. Our team verifies ownership and statistics before listing.",
    },
    {
      icon: Zap,
      title: "Buyer Browses & Inquires",
      description: "Browse verified listings or submit a custom request. Place inquiries or bids on accounts you're interested in.",
    },
    {
      icon: HeadphonesIcon,
      title: "Safe Escrow Transaction",
      description: "Our team negotiates final price and facilitates secure escrow payment. Full protection for both parties.",
    },
  ];

  const benefits = [
    { icon: Shield, title: "Verified Sellers", description: "All accounts verified by our team" },
    { icon: CheckCircle2, title: "Escrow Protection", description: "Secure payment until verification" },
    { icon: HeadphonesIcon, title: "24/7 Support", description: "Fast support via Telegram & Discord" },
    { icon: Award, title: "5+ Years of Experience", description: "Trusted marketplace built by gaming experts since 2019" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative min-h-[600px] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-background/80" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Verified Gaming Account{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Mediation & Escrow Platform
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with verified players through secure negotiation and escrow. Professional verification, safe transactions, guaranteed support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/browse">
                <Button size="xl" className="w-full sm:w-auto btn-primary">
                  Browse Accounts
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">Simple, secure, and transparent process</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative p-6 bg-card border border-border rounded-lg hover:border-primary/50 transition-all duration-300 hover:shadow-glow animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute -top-4 left-6 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <step.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Listings</h2>
              <p className="text-muted-foreground">High-quality verified accounts available now</p>
            </div>
            <Link to="/browse">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing) => (
              <div key={listing.id} className="card-glow p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{listing.title}</h3>
                  <div className="flex space-x-2">
                    {listing.verified && <VerifiedTag type="verified" />}
                    {listing.bidding && <VerifiedTag type="bidding" />}
                  </div>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>{listing.game} • {listing.tier} • Collection Level: {listing.collectionLevel || listing.kd}</p>
                  <p>Level: {listing.level}</p>
                  {listing.characterId && (
                    <p className="text-xs font-mono">ID: {listing.characterId}</p>
                  )}
                  <p className="font-semibold text-primary">
                    ₹{listing.priceRange[0].toLocaleString()} – ₹{listing.priceRange[1].toLocaleString()}
                  </p>
                </div>
                <Link to={`/listing/${listing.id}`}>
                  <Button className="w-full mt-4 btn-primary">
                    View Details
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose GameTradeX</h2>
            <p className="text-muted-foreground text-lg">Your trusted partner for secure gaming account exchanges</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="text-center p-6 bg-card border border-border rounded-lg hover:border-primary/50 transition-all duration-300 hover:shadow-glow"
              >
                <benefit.icon className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Carousel */}
      <SuccessStoriesCarousel />

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join thousands of players who trust GameTradeX for safe account exchanges
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/browse">
                <Button variant="hero" size="lg">
                  Browse Accounts
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <LegalDisclaimer />
        </div>
      </section>
    </div>
  );
};

export default Home;
