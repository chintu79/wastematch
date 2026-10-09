import React from 'react';
import { TechnicalStatus } from '@/types/match';
import { Badge, BadgeVariant } from '@/components/ui/Badge';
import { CheckCircle2, AlertCircle, HelpCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  type: 'technical' | 'eligibility' | 'evidence';
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, status }) => {
  if (type === 'technical') {
    const techStatus = status as TechnicalStatus | 'PENDING';
    const config: Record<TechnicalStatus | 'PENDING', { variant: BadgeVariant; label: string; icon: React.ReactNode }> = {
      COMPATIBLE: { 
        variant: 'eligible', 
        label: 'Compatible',
        icon: <CheckCircle2 className="h-3 w-3 mr-1" />
      },
      NEEDS_TREATMENT: { 
        variant: 'on_hold', 
        label: 'Needs Treatment',
        icon: <AlertCircle className="h-3 w-3 mr-1" />
      },
      INCOMPATIBLE: { 
        variant: 'ineligible', 
        label: 'Incompatible',
        icon: <XCircle className="h-3 w-3 mr-1" />
      },
      MISSING_DATA: { 
        variant: 'pending', 
        label: 'More Info Needed',
        icon: <HelpCircle className="h-3 w-3 mr-1" />
      },
      PENDING: { 
        variant: 'pending', 
        label: 'Analyzing...',
        icon: <HelpCircle className="h-3 w-3 mr-1 animate-pulse" />
      }
    };
    const c = config[techStatus] || config.PENDING;
    return <Badge variant={c.variant}>{c.icon}{c.label}</Badge>;
  }
  
  if (type === 'eligibility') {
    // We'll just define the interface here since it's not exported from types
    const elStatus = status as 'ELIGIBLE' | 'REQUIRES_EXEMPTION' | 'NOT_ELIGIBLE' | 'PENDING';
    const config: Record<'ELIGIBLE' | 'REQUIRES_EXEMPTION' | 'NOT_ELIGIBLE' | 'PENDING', { variant: BadgeVariant; label: string; icon: React.ReactNode }> = {
      ELIGIBLE: { 
        variant: 'eligible', 
        label: 'Eligible',
        icon: <CheckCircle2 className="h-3 w-3 mr-1" />
      },
      REQUIRES_EXEMPTION: { 
        variant: 'on_hold', 
        label: 'Needs review',
        icon: <AlertCircle className="h-3 w-3 mr-1" />
      },
      NOT_ELIGIBLE: { 
        variant: 'ineligible', 
        label: 'Not eligible',
        icon: <XCircle className="h-3 w-3 mr-1" />
      },
      PENDING: { 
        variant: 'pending', 
        label: 'Review Pending',
        icon: <HelpCircle className="h-3 w-3 mr-1" />
      }
    };
    const c = config[elStatus] || config.PENDING;
    return <Badge variant={c.variant}>{c.icon}{c.label}</Badge>;
  }

  // Fallback
  return <Badge variant="neutral">{status.replace(/_/g, ' ')}</Badge>;
};
