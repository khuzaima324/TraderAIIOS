import { SubscriptionTier } from '../types';

export const PLAN_LIMITS = {
  [SubscriptionTier.FREE]: {
    label: 'Free',
    trackers: 1,
    manualScans: 1, 
    chartAnalysis: 1, 
    liveMonitoring: false,
    deepAnalysis: false,
    resetPeriod: 'LIFETIME'
  },
  [SubscriptionTier.PLUS]: {
    label: 'Plus',
    trackers: 5,        
    manualScans: 5,     
    chartAnalysis: 999, 
    liveMonitoring: true,
    deepAnalysis: false,
    resetPeriod: 'DAILY'
  },
  [SubscriptionTier.PRO]: {
    label: 'Pro',
    trackers: 12,       
    manualScans: 15,    
    chartAnalysis: 999, 
    liveMonitoring: true,
    deepAnalysis: true, 
    resetPeriod: 'DAILY'
  }
};