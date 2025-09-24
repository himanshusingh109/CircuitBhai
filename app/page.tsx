"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Recycle,
  Wrench,
  Smartphone,
  Laptop,
  Headphones,
  MessageCircle,
  Play,
  ArrowRight,
  Leaf,
  Users,
  Target,
  Trophy,
  Star,
  TrendingUp,
  CheckCircle,
  Calendar,
  Truck,
  Shield,
  Sparkles,
  Zap,
  Heart,
  Menu,
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="glass-effect sticky top-0 z-50 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img 
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CircuitBhai%20png-JnoLSbsOUcbKHo4etgaInv0EGgE5qI.png"
                alt="CircuitBhai Logo"
                className="w-50 h-50 object-contain bg-transparent"
                
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/chat" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                AI Assistant
              </Link>
              <Link
                href="/find-technicians"
                className="text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                Find Experts
              </Link>
              <Link href="/recycle" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                E-Waste Pickup
              </Link>
              <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Dashboard
              </Link>
              <Link href="/community" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Comminuity
              </Link>
              <ProfileDropdown />
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center gap-4">
              <ProfileDropdown />
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-foreground">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col space-y-6 mt-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                      <img
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CircuitBhai%20png-JnoLSbsOUcbKHo4etgaInv0EGgE5qI.png"
                        alt="CircuitBhai Logo"
                        className="w-16 h-16 object-contain bg-transparent"
                      />
                    </div>
                    <nav className="flex flex-col space-y-4">
                      <Link
                        href="/chat"
                        className="flex items-center gap-3 text-foreground hover:text-primary transition-colors font-medium py-2 px-3 rounded-lg hover:bg-muted"
                      >
                        <MessageCircle className="w-5 h-5" />
                        AI Assistant
                      </Link>
                      <Link
                        href="/find-technicians"
                        className="flex items-center gap-3 text-foreground hover:text-primary transition-colors font-medium py-2 px-3 rounded-lg hover:bg-muted"
                      >
                        <Wrench className="w-5 h-5" />
                        Find Experts
                      </Link>
                      <Link
                        href="/recycle"
                        className="flex items-center gap-3 text-foreground hover:text-primary transition-colors font-medium py-2 px-3 rounded-lg hover:bg-muted"
                      >
                        <Recycle className="w-5 h-5" />
                        E-Waste Pickup
                      </Link>
                      <Link
                        href="/community"
                        className="flex items-center gap-3 text-foreground hover:text-primary transition-colors font-medium py-2 px-3 rounded-lg hover:bg-muted"
                      >
                        <Users className="w-5 h-5" />
                        Community
                      </Link>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 text-foreground hover:text-primary transition-colors font-medium py-2 px-3 rounded-lg hover:bg-muted"
                      >
                        <Trophy className="w-5 h-5" />
                        Dashboard
                      </Link>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-6">
                <Badge variant="secondary" className="bg-primary text-primary-foreground border-primary/20 px-4 py-2">
                  <Leaf className="w-4 h-4 mr-2" />
                  Sustainable Technology Revolution
                </Badge>
                <h1 className="text-5xl lg:text-7xl font-bold text-foreground leading-tight text-balance">
                  Fix Smarter.
                  <span className="text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text">
                    {" "}
                    Live Greener.
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed text-pretty max-w-2xl">
                  Get instant AI-powered repair guidance for your electronics with CircuitBhai. Track your progress,
                  earn rewards, and join a community of repair enthusiasts making a real environmental impact.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/chat">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Start AI Repair Chat
                    <Sparkles className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-card to-muted border border-border/50 hover:shadow-lg transition-all duration-300">
                  <div className="text-3xl font-bold text-primary mb-1">50K+</div>
                  <div className="text-sm text-muted-foreground font-medium">Devices Repaired</div>
                </div>
                <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-card to-muted border border-border/50 hover:shadow-lg transition-all duration-300">
                  <div className="text-3xl font-bold text-accent mb-1">15K+</div>
                  <div className="text-sm text-muted-foreground font-medium">Active Members</div>
                </div>
                <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-card to-muted border border-border/50 hover:shadow-lg transition-all duration-300">
                  <div className="text-3xl font-bold text-primary mb-1">2M+</div>
                  <div className="text-sm text-muted-foreground font-medium">Tons E-waste Saved</div>
                </div>
              </div>
            </div>

            <div className="relative animate-slide-up">
              <div className="relative z-10">
                <img
                  src="/Gemini_Generated_Image_11x78i11x78i11x7.png"
                  alt="Person repairing electronic device"
                  className="w-full h-auto rounded-3xl shadow-2xl border border-border/20"
                />
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                  <Zap className="w-10 h-10 text-primary-foreground" />
                </div>
                <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center shadow-lg">
                  <Heart className="w-8 h-8 text-primary-foreground" />
                </div>
              </div>
              <div className="absolute -top-8 -right-8 w-80 h-80 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl opacity-60"></div>
              <div className="absolute -bottom-8 -left-8 w-80 h-80 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-3xl opacity-60"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Rewards Section */}
      <section className="py-24 bg-gradient-to-br from-muted/30 to-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-20">
            <Badge variant="secondary" className="bg-accent text-accent-foreground border-accent/20 px-4 py-2">
              <Trophy className="w-4 h-4 mr-2" />
              Level Up Your Skills
            </Badge>
            <h2 className="text-4xl lg:text-6xl font-bold text-foreground text-balance">
              Earn Rewards While You Repair
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto text-pretty leading-relaxed">
              Complete repairs, help others, and climb the leaderboard. Every fix makes you a better repairer and helps
              save the planet.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 mb-16">
            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 text-center p-8 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-card to-background">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Star className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Earn Points</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get points for every successful repair and helpful community contribution.
              </p>
            </Card>

            <Card className="border-2 border-accent/20 hover:border-accent/40 transition-all duration-300 text-center p-8 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-card to-background">
              <div className="w-20 h-20 bg-gradient-to-br from-accent/10 to-accent/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Trophy className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Unlock Badges</h3>
              <p className="text-muted-foreground leading-relaxed">
                Collect achievement badges as you master different device types and repair skills.
              </p>
            </Card>

            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 text-center p-8 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-card to-background">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <TrendingUp className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Track Progress</h3>
              <p className="text-muted-foreground leading-relaxed">
                Monitor your repair journey with detailed progress tracking and skill development.
              </p>
            </Card>

            <Card className="border-2 border-accent/20 hover:border-accent/40 transition-all duration-300 text-center p-8 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-card to-background">
              <div className="w-20 h-20 bg-gradient-to-br from-accent/10 to-accent/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Users className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Join Leaderboard</h3>
              <p className="text-muted-foreground leading-relaxed">
                Compete with fellow repairers and see how you rank in the global community.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-20">
            <Badge variant="secondary" className="bg-primary text-primary-foreground border-primary/20 px-4 py-2">
              <Target className="w-4 h-4 mr-2" />
              Empower Yourself
            </Badge>
            <h2 className="text-4xl lg:text-6xl font-bold text-foreground text-balance">Take Control of Your Tech</h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto text-pretty leading-relaxed">
              Don't let broken devices become e-waste. Learn to repair, maintain, and extend the life of your
              electronics with our comprehensive platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 mb-16">
            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 group hover:shadow-2xl hover:-translate-y-2 bg-gradient-to-br from-card to-background">
              <CardContent className="p-10 text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <MessageCircle className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">AI Diagnosis & Repair</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Chat with our AI to describe your device issue. Get instant diagnosis, step-by-step repair
                  instructions, and curated video tutorials.
                </p>
                <Link href="/chat">
                  <Button
                    variant="outline"
                    className="w-full border-primary/20 text-primary hover:bg-primary/5 bg-transparent hover:shadow-md transition-all duration-300"
                  >
                    Start Repair Chat
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-accent/20 hover:border-accent/40 transition-all duration-300 group hover:shadow-2xl hover:-translate-y-2 bg-gradient-to-br from-card to-background">
              <CardContent className="p-10 text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-accent/10 to-accent/20 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <CheckCircle className="w-10 h-10 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Progress Tracking</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Track your repair journey with visual progress indicators, completion milestones, and personalized
                  recommendations.
                </p>
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    className="w-full border-accent/20 text-accent hover:bg-accent/5 bg-transparent hover:shadow-md transition-all duration-300"
                  >
                    View Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 group hover:shadow-2xl hover:-translate-y-2 bg-gradient-to-br from-card to-background">
              <CardContent className="p-10 text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Users className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Community Support</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Join thousands of repair enthusiasts sharing tips, success stories, and helping each other fix
                  devices.
                </p>
                <Link href="/community">
                  <Button
                    variant="outline"
                    className="w-full border-primary/20 text-primary hover:bg-primary/5 bg-transparent hover:shadow-md transition-all duration-300"
                  >
                    Join Community
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-br from-card to-muted rounded-3xl p-12 lg:p-16 border border-border/50 shadow-xl">
            <div className="text-center space-y-6 mb-16">
              <h3 className="text-3xl lg:text-4xl font-bold text-foreground">We Support All Your Devices</h3>
              <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
                From smartphones to laptops, our AI can help diagnose and repair issues across all major device
                categories.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center space-y-4 p-6 rounded-2xl hover:bg-background/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="w-24 h-24 bg-gradient-to-br from-background to-card rounded-3xl shadow-lg flex items-center justify-center mx-auto border border-border/50">
                  <Smartphone className="w-12 h-12 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-lg">Smartphones</h4>
                  <p className="text-sm text-muted-foreground">Screen, battery, charging</p>
                </div>
              </div>

              <div className="text-center space-y-4 p-6 rounded-2xl hover:bg-background/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="w-24 h-24 bg-gradient-to-br from-background to-card rounded-3xl shadow-lg flex items-center justify-center mx-auto border border-border/50">
                  <Laptop className="w-12 h-12 text-accent" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-lg">Laptops</h4>
                  <p className="text-sm text-muted-foreground">Hardware, software issues</p>
                </div>
              </div>

              <div className="text-center space-y-4 p-6 rounded-2xl hover:bg-background/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="w-24 h-24 bg-gradient-to-br from-background to-card rounded-3xl shadow-lg flex items-center justify-center mx-auto border border-border/50">
                  <Headphones className="w-12 h-12 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-lg">Audio Devices</h4>
                  <p className="text-sm text-muted-foreground">Headphones, speakers</p>
                </div>
              </div>

              <div className="text-center space-y-4 p-6 rounded-2xl hover:bg-background/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="w-24 h-24 bg-gradient-to-br from-background to-card rounded-3xl shadow-lg flex items-center justify-center mx-auto border border-border/50">
                  <Wrench className="w-12 h-12 text-accent" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-lg">Appliances</h4>
                  <p className="text-sm text-muted-foreground">Small electronics</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced E-Waste Pickup Section */}
      <section className="py-24 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-16">
            <Badge variant="secondary" className="bg-primary text-primary-foreground border-primary/20 px-4 py-2">
              <Leaf className="w-4 h-4 mr-2" />
              Eco-Friendly Initiative
            </Badge>
            <h2 className="text-4xl lg:text-6xl font-bold text-foreground text-balance">
              Recycle Your E-Waste Responsibly
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto text-pretty leading-relaxed">
              Can't repair it? Don't throw it away! Schedule a pickup and we'll ensure your electronic waste is recycled
              properly by certified facilities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 text-center p-8 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-card to-background">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Calendar className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Easy Scheduling</h3>
              <p className="text-muted-foreground leading-relaxed">
                Book a pickup at your convenience with our simple online form.
              </p>
            </Card>

            <Card className="border-2 border-accent/20 hover:border-accent/40 transition-all duration-300 text-center p-8 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-card to-background">
              <div className="w-20 h-20 bg-gradient-to-br from-accent/10 to-accent/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Truck className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Free Collection</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our certified team collects your e-waste at no cost to you.
              </p>
            </Card>

            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 text-center p-8 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-card to-background">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Shield className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Certified Recycling</h3>
              <p className="text-muted-foreground leading-relaxed">
                All items are processed by verified recycling facilities.
              </p>
            </Card>
          </div>

          <div className="text-center">
            <Link href="/recycle">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4"
              >
                <Recycle className="w-5 h-5 mr-2" />
                Schedule E-Waste Pickup
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary via-accent to-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-primary-foreground text-balance">
              Ready to Start Repairing?
            </h2>
            <p className="text-xl text-primary-foreground/90 text-pretty leading-relaxed max-w-3xl mx-auto">
              Join our community of repair enthusiasts and start your journey towards sustainable technology use. Earn
              rewards, track progress, and make a difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/chat">
                <Button
                  size="lg"
                  className="bg-background text-foreground hover:bg-background/90 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Start AI Repair Chat
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 bg-transparent px-8 py-4 hover:shadow-lg transition-all duration-300"
              >
                <Trophy className="w-5 h-5 mr-2" />
                View Leaderboard
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-br from-card to-muted border-t border-border/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CircuitBhai%20png-JnoLSbsOUcbKHo4etgaInv0EGgE5qI.png"
                  alt="CircuitBhai Logo"
                  className="w-20 h-20 object-contain bg-transparent"
                />
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Empowering people to repair, reuse, and reduce e-waste through AI-powered guidance and community
                support.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-foreground text-lg">Features</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="hover:text-primary transition-colors cursor-pointer">AI Repair Assistant</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Progress Tracking</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Community Forum</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Gamification</li>
                <li className="hover:text-primary transition-colors cursor-pointer">E-Waste Pickup</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-foreground text-lg">Support</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="hover:text-primary transition-colors cursor-pointer">Help Center</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Contact Us</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Report Issue</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Feedback</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-foreground text-lg">Company</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="hover:text-primary transition-colors cursor-pointer">About Us</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Terms of Service</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Sustainability</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/50 mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 CircuitBhai. All rights reserved. Built for sustainability.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
