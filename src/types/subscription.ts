export interface Subscription {
  _id: string;
  name: string;
  pricingModel: 'Fixed' | 'Tiered' | 'Usage' | 'Per Seat';
  contractLengthMonths: number; // in months
  billingCadence: 'Monthly' | 'Quarterly' | 'Annually';
  setupFee: number;
  prepaymentPercentage: number;
  capAmount: number;
  overageCost: number;
  clientCount?: number;
}
