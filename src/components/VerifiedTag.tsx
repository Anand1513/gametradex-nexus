import React from 'react';
import { CheckCircle, TrendingUp } from 'lucide-react';

interface VerifiedTagProps {
  type: 'verified' | 'bidding';
  className?: string;
}

const VerifiedTag: React.FC<VerifiedTagProps> = ({ type, className = "" }) => {
  if (type === 'verified') {
    return (
      <span className={`verified-badge ${className}`}>
        <CheckCircle className="w-3 h-3 mr-1" />
        ✅ Verified
      </span>
    );
  }

  return (
    <span className={`bidding-badge ${className}`}>
      <TrendingUp className="w-3 h-3 mr-1" />
      📈 Bidding Open
    </span>
  );
};

export default VerifiedTag;


