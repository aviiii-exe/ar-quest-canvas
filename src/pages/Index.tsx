import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { FloatingNav } from '@/components/layout/FloatingNav';
import { Button } from "@/components/ui/button";
import { HampiGuideChat } from "@/components/guide/HampiGuideChat";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { QuickLinkCard } from "@/components/landing/QuickLinkCard";
import { MapPin, Trophy, Compass, Sparkles, ArrowRight, Map, Camera, Stamp, MessageCircle } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If user is authenticated, show the Guide/Chatbot
  if (user) {
    return (
      <div className="min-h-screen bg-background">
        <FloatingNav />
        
        <div className="container pt-20 pb-8">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Chat Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Hampi Guide</h1>
              <p className="text-muted-foreground">
                Your AI-powered travel companion for exploring Hampi
              </p>
            </div>

            {/* Chatbot Interface */}
            <HampiGuideChat />

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-4">
              <QuickLinkCard
                icon={Map}
                title="Explore Map"
                description="Discover sites"
                onClick={() => navigate('/map')}
              />
              <QuickLinkCard
                icon={Stamp}
                iconColorClass="text-emerald-500"
                title="My Passport"
                description="View stamps"
                onClick={() => navigate('/profile')}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated users - Landing page
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          {/* Logo/Brand */}
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center">
              <Compass className="h-8 w-8 text-primary-foreground" />
            </div>
            <span className="text-3xl font-bold">Hampi Quest</span>
          </div>

          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            UNESCO World Heritage Experience
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
            Unlock the Secrets of the <span className="text-primary">Vijayanagara Empire</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your Hampi visit into an epic adventure. Collect digital stamps, 
            earn achievements, compete with fellow explorers, and discover ancient stories 
            through AR experiences.
          </p>

          {/* Single CTA Button */}
          <div className="pt-4">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="gap-2 text-lg px-8 py-6"
            >
              Begin Your Adventure
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-4">
            <FeatureCard
              icon={Map}
              title="Interactive Map"
              description="Navigate heritage sites with GPS-powered exploration"
            />
            <FeatureCard
              icon={Stamp}
              title="Digital Passport"
              description="Collect unique stamps at each site you visit"
              iconColorClass="text-emerald-500"
              iconBgClass="bg-emerald-500/10 group-hover:bg-emerald-500/20"
            />
            <FeatureCard
              icon={Trophy}
              title="Achievements"
              description="Earn XP, unlock badges, and climb the leaderboard"
              iconColorClass="text-amber-500"
              iconBgClass="bg-amber-500/10 group-hover:bg-amber-500/20"
            />
            <FeatureCard
              icon={Camera}
              title="AR Experiences"
              description="Scan QR codes to unlock hidden stories and 3D models"
              iconColorClass="text-purple-500"
              iconBgClass="bg-purple-500/10 group-hover:bg-purple-500/20"
            />
          </div>
        </div>

        {/* Social Proof / Stats */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-wrap justify-center gap-8 md:gap-16 py-6 px-8 rounded-2xl bg-muted/30">
            <div>
              <div className="text-3xl font-bold text-primary">15+</div>
              <div className="text-sm text-muted-foreground">Heritage Sites</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-500">20+</div>
              <div className="text-sm text-muted-foreground">Achievements</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-500">5</div>
              <div className="text-sm text-muted-foreground">Exploration Modes</div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            Ready to become a Hampi Heritage Explorer?
          </p>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate("/auth")}
            className="gap-2"
          >
            <MapPin className="h-4 w-4" />
            Start Exploring Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;