import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LegalDisclaimer from '@/components/LegalDisclaimer';

const RefundPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-4">
              Refund Policy
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: January 2025
            </p>
          </div>

          <div className="space-y-8">
            <Card className="card-glow">
              <CardHeader>
                <CardTitle>1. Escrow Refunds</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Escrow refunds are available under the following conditions:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Before verification is complete and account transfer begins</li>
                  <li>If the seller fails to provide required verification documents</li>
                  <li>If the account details significantly differ from the listing</li>
                  <li>If both parties mutually agree to cancel the transaction</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardHeader>
                <CardTitle>2. Service Fee Refunds</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Service fees are generally non-refundable, except in cases of:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Platform technical errors on our end</li>
                  <li>Fraudulent activity by the other party</li>
                  <li>Violation of our Terms of Service by the other party</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardHeader>
                <CardTitle>3. Refund Process</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  To request a refund:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Contact our support team within 48 hours of the issue</li>
                  <li>Provide transaction details and reason for refund</li>
                  <li>Allow 3-5 business days for review</li>
                  <li>Refunds will be processed to the original payment method</li>
                </ol>
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardHeader>
                <CardTitle>4. Dispute Resolution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  In case of disputes regarding refunds:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>GameTradeX will act as a neutral mediator</li>
                  <li>Our decision is final and binding</li>
                  <li>We may require additional documentation</li>
                  <li>Resolution typically takes 5-7 business days</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardHeader>
                <CardTitle>5. Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  For refund requests or questions, contact us:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Email: support@gametradex.com</li>
                  <li>Telegram: @GameTradeXSupport</li>
                  <li>Discord: GameTradeX Community</li>
                </ul>
              </CardContent>
            </Card>

            <LegalDisclaimer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;


