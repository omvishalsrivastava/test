import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-12 bg-muted/30">
      <div className="container flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full overflow-hidden border border-primary/20">
            <img src="/mars-ultra.png" alt="Mars" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold tracking-tight">OpenMars</span>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6">
          <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">About</Link>
          <Link href="/privacy" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
          <Link href="/terms" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Terms</Link>
          <Link href="/disclaimer" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Disclaimer</Link>
          <a href="mailto:contact@openmars.example.com" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Contact</a>
        </div>

        <p className="text-sm text-muted-foreground">
          © 2026 OpenMars Aerospace. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
