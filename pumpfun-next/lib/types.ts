export interface DuneRow {
  [key: string]: string | number | null;
}

export interface DailyVolume {
  day: string;
  volume_sol: number;
  buy_vol: number;
  sell_vol: number;
  trades: number;
  unique_traders: number;
}

export interface DailyLaunches {
  day: string;
  launches: number;
}

export interface GraduationRate {
  day: string;
  launches: number;
  graduations: number;
  grad_rate: number | string;
}

export interface FeeRevenue {
  day: string;
  protocol_fees: number;
  creator_fees: number;
  total_fees: number;
}

export interface TradeSizeDist {
  bucket: string;
  pct_vol: number;
  cnt: number;
}

export interface TokenSurvival {
  bucket: string;
  pct: number;
  cnt: number;
}

export interface BondingCurve {
  bucket: string;
  pct: number;
  cnt: number;
}

export interface HourlyPattern {
  hr: number;
  vol: number;
  traders: number;
}

export interface PriceImpact {
  day: string;
  med: number;
  p95: number;
  p99: number;
}

export interface NewVsReturning {
  day: string;
  new_traders: number;
  returning_traders: number;
}

export interface TopTraderPnl {
  trader: string;
  pnl: number;
  buys: number;
  sells: number;
  volume_sol: number;
}

export interface WhaleTracker {
  trader: string;
  volume_sol: number;
  trades: number;
  tokens_traded: number;
}

export interface SandwichDetection {
  day: string;
  attacks: number;
  bots: number;
}

export interface BotActivity {
  day: string;
  bot: string;
  vol_usd: number;
  trades: number;
}

export interface FeeByCurveStage {
  curve_stage: string;
  volume_sol: number;
  protocol_fees_sol: number;
  creator_fees_sol: number;
  pct_of_total_volume: number;
  effective_creator_rate: number;
}

export interface FeeVsSurvival {
  fee_tier: string;
  median_lifespan_min: number;
  avg_lifespan_min: number;
  avg_volume_sol: number;
  token_count: number;
}

export interface VariableFeeModel {
  model: string;
  total_fee_sol: number;
}

export interface FeeCurveGranular {
  reserve_bucket_sol: number;
  volume_sol: number;
  avg_creator_fee_pct: number;
}

export interface SolPrice {
  price: number;
  change_24h: number;
  vol_24h: number;
  mcap: number;
}
