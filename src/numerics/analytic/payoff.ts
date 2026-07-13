export function intrinsic(spot: number, strike: number, isCall: boolean): number {
  return isCall ? Math.max(spot - strike, 0) : Math.max(strike - spot, 0)
}
