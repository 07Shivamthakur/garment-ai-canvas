import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Upload, Zap, Shield } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background-2">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">AI Garment Studio Pro</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/agent")}
              className="hidden sm:inline-flex"
            >
              Login
            </Button>
            <Button onClick={() => navigate("/agent")}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-4">
            <Zap className="w-4 h-4" />
            <span>Powered by AI</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
            Design to Garment
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-hover to-accent bg-clip-text text-transparent">
              with AI Precision
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform design concepts into realistic garment mockups and model try-ons. 
            Professional AI processing with secure Make.com integration.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              className="text-lg px-8 h-14"
              onClick={() => navigate("/agent")}
            >
              Start Now
              <Sparkles className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 h-14"
              onClick={() => window.open("#", "_blank")}
            >
              View Docs
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Design → Garment Mockups</h3>
            <p className="text-muted-foreground">
              Transform your design images into professional garment mockups. 
              Support for t-shirts, hoodies, sarees, and more.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Garment → Model Render</h3>
            <p className="text-muted-foreground">
              Upload garment photos and get professional model renders. 
              See your products on AI-generated models.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Exact Model Try-On</h3>
            <p className="text-muted-foreground">
              Combine specific garments with specific models. 
              Perfect for personalized product visualization.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mx-auto text-2xl font-bold text-primary">
                1
              </div>
              <h3 className="text-xl font-semibold">Upload Your Files</h3>
              <p className="text-muted-foreground">
                Choose your flow and upload design images, garment photos, or model images
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mx-auto text-2xl font-bold text-primary">
                2
              </div>
              <h3 className="text-xl font-semibold">AI Processing</h3>
              <p className="text-muted-foreground">
                Secure submission to Make.com for professional AI processing
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mx-auto text-2xl font-bold text-primary">
                3
              </div>
              <h3 className="text-xl font-semibold">Preview & Download</h3>
              <p className="text-muted-foreground">
                Instant preview of results with direct download links
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Badge */}
      <section className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto text-center p-8 rounded-2xl bg-card border border-border">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Secure Processing</h3>
          <p className="text-muted-foreground">
            All files are sent securely via HTTPS to Make.com. 
            Enterprise-grade security for your creative assets.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">AI Garment Studio Pro</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="mailto:support@example.com" className="hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground mt-8">
            © 2025 AI Garment Studio Pro. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
