export interface PremiumCalculationInput {
  declaredValue: number;
  percentageRate: number;
  minPremium: number;
  maxCoverage: number;
}

export interface PremiumCalculationResult {
  premium: number;
  coverage: number;
}