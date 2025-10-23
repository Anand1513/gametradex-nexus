import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LegalDisclaimer from '@/components/LegalDisclaimer';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-4">
              Terms of Service
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: January 2025
            </p>
          </div>

          <div className="space-y-8">
            <Card className="card-glow">
              <CardHeader>
                <CardTitle>1. Platform Identity & Purpose</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  GameTradeX is an independent mediation platform that verifies and connects Battle Royale players for secure exchanges.
                  We are not affiliated with Krafton, BGMI, or any other publisher. All trademarks belong to their respective owners.
                </p>
                <p className="text-muted-foreground">
                  Our platform provides verification, escrow, and negotiation services only. We do not directly sell, own, or purchase gaming accounts.
                </p>
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardHeader>
                <CardTitle>2. User Responsibilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  By using GameTradeX, you acknowledge and agree that:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>You are the rightful owner of any gaming account you list for exchange</li>
                  <li>You understand that GameTradeX provides mediation only, not direct account sales</li>
                  <li>You take full responsibility for your actions and any consequences</li>
                  <li>Selling or exchanging accounts may violate a game's Terms of Service</li>
                  <li>You will not use the platform for fraudulent or illegal activities</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardHeader>
                <CardTitle>3. Service Limitations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  GameTradeX provides the following services:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Account verification and validation</li>
                  <li>Secure escrow services for transactions</li>
                  <li>Mediation between buyers and sellers</li>
                  <li>Dispute resolution assistance</li>
                </ul>
                <p className="text-muted-foreground">
                  We do not guarantee the success of any transaction or the authenticity of any account beyond our verification process.
                </p>
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardHeader>
                <CardTitle>4. Fees and Payments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  GameTradeX charges the following fees for our services:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Platform Fee: 5% of transaction value</li>
                  <li>Escrow Fee: 2% of transaction value</li>
                  <li>Verification Fee: 1% of transaction value</li>
                </ul>
                <p className="text-muted-foreground">
                  All fees are clearly displayed before transaction completion.
                </p>
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardHeader>
                <CardTitle>5. Dispute Resolution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  GameTradeX acts as a neutral moderator in disputes. Our decision is final and binding.
                  We reserve the right to suspend or terminate accounts that violate these terms.
                </p>
              </CardContent>
            </Card>

            <LegalDisclaimer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;


