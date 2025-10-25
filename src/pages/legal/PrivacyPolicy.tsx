import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LegalDisclaimer from '@/components/LegalDisclaimer';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: January 2025
            </p>
          </div>

          <div className="space-y-8">
            <Card className="card-glow">
              <CardHeader>
                <CardTitle>1. Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We collect only the information necessary to provide our mediation services:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Contact information (name, email, phone)</li>
                  <li>Partial gaming account identifiers (masked for security)</li>
                  <li>Account statistics (tier, collection level, level) for verification</li>
                  <li>Transaction history and communication logs</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardHeader>
                <CardTitle>2. Data Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We implement industry-standard security measures:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>All user data is encrypted in transit and at rest</li>
                  <li>No full game IDs are stored on our servers</li>
                  <li>Access to personal information is restricted to authorized personnel only</li>
                  <li>Regular security audits and updates</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardHeader>
                <CardTitle>3. How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Your information is used solely for:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Account verification and validation</li>
                  <li>Facilitating secure transactions</li>
                  <li>Providing customer support</li>
                  <li>Improving our services</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardHeader>
                <CardTitle>4. Information Sharing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We do not sell, trade, or share your personal information with third parties except:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>When required by law or legal process</li>
                  <li>To protect our rights and prevent fraud</li>
                  <li>With your explicit consent</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardHeader>
                <CardTitle>5. Your Rights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate data</li>
                  <li>Delete your account and data</li>
                  <li>Opt-out of communications</li>
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

export default PrivacyPolicy;


