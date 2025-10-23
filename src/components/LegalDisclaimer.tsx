import React from 'react';

interface LegalDisclaimerProps {
  className?: string;
}

const LegalDisclaimer: React.FC<LegalDisclaimerProps> = ({ className = "" }) => {
  return (
    <div className={`bg-destructive/10 border border-destructive/20 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-destructive mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-destructive mb-2">
            ⚠️ Legal Disclaimer
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            GameTradeX provides verified mediation and escrow services only. We do not sell, own, or purchase gaming accounts.
            Using this service is at users' discretion. Selling or exchanging accounts may violate a game's Terms of Service,
            and users take full responsibility for their actions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegalDisclaimer;


