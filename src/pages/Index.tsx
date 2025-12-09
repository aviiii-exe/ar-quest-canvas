import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { FloatingNav } from '@/components/layout/FloatingNav';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HampiGuideChat } from "@/components/guide/HampiGuideChat";
import { MapPin, Trophy, Compass, Sparkles, ArrowRight, Map, Camera, Star, Stamp, MessageCircle } from "lucide-react";

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
              <Card 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate('/map')}
              >
                <CardContent className="flex items-center gap-3 py-4">
                  <Map className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">Explore Map</p>
                    <p className="text-sm text-muted-foreground">Discover sites</p>
                  </div>
                </CardContent>
              </Card>
              <Card 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate('/profile')}
              >
                <CardContent className="flex items-center gap-3 py-4">
                  <Stamp className="h-8 w-8 text-emerald-500" />
                  <div>
                    <p className="font-medium">My Passport</p>
                    <p className="text-sm text-muted-foreground">View stamps</p>
                  </div>
                </CardContent>
              </Card>
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

        {/* Feature Cards - Horizontal Scroll on Mobile */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-card/50 backdrop-blur border-border/50 group hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Map className="h-6 w-6 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base mb-1">Interactive Map</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Navigate heritage sites with GPS-powered exploration
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50 group hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                  <Stamp className="h-6 w-6 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base mb-1">Digital Passport</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Collect unique stamps at each site you visit
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50 group hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                  <Trophy className="h-6 w-6 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base mb-1">Achievements</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Earn XP, unlock badges, and climb the leaderboard
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50 group hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                  <Camera className="h-6 w-6 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base mb-1">AR Experiences</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Scan QR codes to unlock hidden stories and 3D models
                </p>
              </CardContent>
            </Card>
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