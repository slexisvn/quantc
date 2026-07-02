import { describe, it, expect } from 'vitest'
import { europeanTrade, forwardTrade, type MarketState, type ExposureConfig } from '../../src/risk/exposure'
import { simulateNettingSetExposure, portfolioXva, type NettingSet, type CounterpartyPortfolio } from '../../src/xva/netting'

const market: MarketState = { spot: 100, rate: 0.02, vol: 0.25 }
const grid = Array.from({ length: 10 }, (_, i) => (i + 1) * 0.1)
const config: ExposureConfig = { grid, paths: 20000, seed: 4242, quantile: 0.95, collateralThreshold: 0 }
const spec = { rate: 0.02, hazardRate: 0.03, recovery: 0.4, ownHazardRate: 0, ownRecovery: 0.4, fundingSpread: 0 }

const sum = (a: readonly number[]): number => a.reduce((x, y) => x + y, 0)

describe('netting sets', () => {
  const long = forwardTrade(100, 1, 0.02, 1)
  const short = forwardTrade(100, 1, 0.02, -1)

  it('a payer and receiver in the same set net to almost zero exposure', () => {
    const netted: NettingSet = { id: 'netted', trades: [long, short] }
    const profile = simulateNettingSetExposure(netted, market, config)
    expect(sum(profile.epe)).toBeLessThan(1e-6)
  })

  it('splitting the same trades into separate sets destroys the netting benefit', () => {
    const netted: CounterpartyPortfolio = { counterparty: 'cp', nettingSets: [{ id: 'both', trades: [long, short] }] }
    const split: CounterpartyPortfolio = { counterparty: 'cp', nettingSets: [{ id: 'a', trades: [long] }, { id: 'b', trades: [short] }] }
    const nettedCva = portfolioXva(netted, market, config, spec).total.cva
    const splitCva = portfolioXva(split, market, config, spec).total.cva
    expect(splitCva).toBeGreaterThan(0)
    expect(nettedCva).toBeLessThan(splitCva)
  })

  it('a tight CSA sharply reduces expected exposure', () => {
    const trades = [europeanTrade(100, 1, 0.02, 0.25, true, 1)]
    const uncollateralised = simulateNettingSetExposure({ id: 'u', trades }, market, config)
    const collateralised = simulateNettingSetExposure(
      { id: 'c', trades, csa: { threshold: 0, minimumTransfer: 0, independentAmount: 0, marginPeriodOfRisk: 0.1 } },
      market,
      config,
    )
    expect(sum(collateralised.epe)).toBeLessThan(0.5 * sum(uncollateralised.epe))
  })
})
