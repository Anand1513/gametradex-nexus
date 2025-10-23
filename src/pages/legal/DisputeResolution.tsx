import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LegalDisclaimer from '@/components/LegalDisclaimer';

const DisputeResolution: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-4">
              Dispute Resolution
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: January 2025
            </p>
          </div>

          <div className="space-y-8">
            <Card className="card-glow">
              <CardHeader>
                <CardTitle>1. Our Role as Mediator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  GameTradeX acts as a neutral moderator in all disputes. We:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Review all evidence and communication logs</li>
                  <li>Make impartial decisions based on platform policies</li>
                  <li>Facilitate communication between parties</li>
                  <li>Ensure fair resolution for all parties involved</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardHeader>
                <CardTitle>2. Types of Disputes We Handle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We handle disputes related to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Account verification discrepancies</li>
                  <li>Payment and escrow issues</li>
                  <li>Account transfer problems</li>
                  <li>Service fee disputes</li>
                  <li>Communication and coordination issues</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardHeader>
                <CardTitle>3. Dispute Resolution Process</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Our resolution process follows these steps:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Initial dispute report and evidence collection</li>
                  <li>Review of transaction history and communications</li>
                  <li>Investigation and fact-finding (3-5 business days)</li>
                  <li>Mediation attempt between parties</li>
                  <li>Final decision and implementation</li>
                </ol>
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardHeader>
                <CardTitle>4. Evidence Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  To support your case, provide:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Screenshots of all relevant communications</li>
                  <li>Transaction records and receipts</li>
                  <li>Account verification documents</li>
                  <li>Any other supporting evidence</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardHeader>
                <CardTitle>5. Resolution Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Typical resolution timelines:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Initial response: 24 hours</li>
                  <li>Evidence review: 3-5 business days</li>
                  <li>Mediation period: 2-3 business days</li>
                  <li>Final decision: 1-2 business days</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardHeader>
                <CardTitle>6. Appeal Process</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  If you disagree with our decision:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Submit new evidence within 48 hours</li>
                  <li>Request escalation to senior mediator</li>
                  <li>Provide additional context or clarification</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardHeader>
                <CardTitle>7. Contact for Disputes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  To report a dispute:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Email: disputes@gametradex.com</li>
                  <li>Telegram: @GameTradeXDisputes</li>
                  <li>Include transaction ID and detailed description</li>
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

export default DisputeResolution;


