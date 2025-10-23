import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center font-bold text-lg">
                GT
              </div>
              <span className="text-xl font-bold">GameTradeX</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Secure platform for verified Battle Royale account exchanges with professional escrow and verification services.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/browse" className="text-muted-foreground hover:text-primary transition-colors">
                  Browse Listings
                </Link>
              </li>
              <li>
                <Link to="/sell" className="text-muted-foreground hover:text-primary transition-colors">
                  Sell Your Account
                </Link>
              </li>
              <li>
                <Link to="/inquiry" className="text-muted-foreground hover:text-primary transition-colors">
                  Custom Request
                </Link>
              </li>
              <li>
                <Link to="/bidding" className="text-muted-foreground hover:text-primary transition-colors">
                  Bidding Dashboard
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Email: support@gametradex.com</li>
              <li>Telegram: @GameTradeX</li>
              <li>Discord: GameTradeX#0001</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/legal/terms" className="text-muted-foreground hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/legal/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/legal/refund" className="text-muted-foreground hover:text-primary transition-colors">
                    Refund Policy
                  </Link>
                </li>
                <li>
                  <Link to="/legal/disputes" className="text-muted-foreground hover:text-primary transition-colors">
                    Dispute Resolution
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform Identity</h3>
              <p className="text-xs text-muted-foreground">
                GameTradeX is an independent mediation platform that verifies and connects Battle Royale players for secure exchanges.
                We are not affiliated with Krafton, BGMI, or any other publisher. All trademarks belong to their respective owners.
              </p>
            </div>
          </div>
          
          <div className="border-t border-border pt-6">
            <p className="text-xs text-muted-foreground text-center">
              <span className="font-semibold">⚠️ Legal Disclaimer:</span> GameTradeX provides verified mediation and escrow services only. 
              We do not sell, own, or purchase gaming accounts. Using this service is at users' discretion. 
              Selling or exchanging accounts may violate a game's Terms of Service, and users take full responsibility for their actions.
            </p>
            <p className="text-xs text-muted-foreground text-center mt-4">
              © 2025 GameTradeX. Independent Escrow & Mediation Platform. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
