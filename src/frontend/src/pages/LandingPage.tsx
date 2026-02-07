import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Skull } from 'lucide-react';

export default function LandingPage() {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Hero Background */}
      <div 
        className="absolute inset-0 z-0 opacity-30"
        style={{
          backgroundImage: 'url(/assets/generated/hero-bg.dim_1600x600.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        <div className="mb-8 flex justify-center">
          <img 
            src="/assets/generated/logo.dim_512x512.png" 
            alt="Logo" 
            className="h-32 w-32 drop-shadow-2xl"
          />
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tight">
          METAL<span className="text-destructive">HEAD</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-2 font-medium">
          Unfiltered. Uncompromising. Unapologetic.
        </p>
        
        <p className="text-lg text-muted-foreground/80 mb-8">
          The social space for rock, punk, and metal fans 21+
        </p>

        <div className="flex flex-col items-center gap-4 mb-12">
          <Button
            onClick={login}
            disabled={isLoggingIn}
            size="lg"
            className="text-lg px-8 py-6 font-bold"
          >
            {isLoggingIn ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Connecting...
              </>
            ) : (
              <>
                <Skull className="mr-2 h-5 w-5" />
                Enter the Pit
              </>
            )}
          </Button>
          
          <p className="text-sm text-muted-foreground">
            Must be 21+ to enter
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg border border-border">
            <h3 className="font-bold text-lg mb-2">Connect</h3>
            <p className="text-sm text-muted-foreground">
              Find your tribe. Build real friendships with fellow metalheads.
            </p>
          </div>
          <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg border border-border">
            <h3 className="font-bold text-lg mb-2">Share</h3>
            <p className="text-sm text-muted-foreground">
              Post without filters. Express yourself authentically.
            </p>
          </div>
          <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg border border-border">
            <h3 className="font-bold text-lg mb-2">Discover</h3>
            <p className="text-sm text-muted-foreground">
              Explore new bands, shows, and underground scenes.
            </p>
          </div>
        </div>

        <footer className="mt-16 text-sm text-muted-foreground/60">
          © 2026. Built with 🤘 using{' '}
          <a 
            href="https://caffeine.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}
