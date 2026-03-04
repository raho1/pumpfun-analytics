/**
 * Statistical projection utilities for trend analysis.
 * All methods are client-side — no additional Dune queries needed.
 */

export interface RegressionResult {
  slope: number;
  intercept: number;
  r2: number;
}

export interface ProjectedPoint {
  day: string;
  value: number;
  upper: number;
  lower: number;
}

/**
 * Ordinary least-squares linear regression.
 * Maps data to numeric x (day index) and y (value).
 */
export function linearRegression(
  xs: number[],
  ys: number[]
): RegressionResult {
  const n = xs.length;
  if (n < 2) return { slope: 0, intercept: ys[0] ?? 0, r2: 0 };

  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((a, x, i) => a + x * ys[i], 0);
  const sumX2 = xs.reduce((a, x) => a + x * x, 0);

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: sumY / n, r2: 0 };

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  // R² goodness of fit
  const meanY = sumY / n;
  const ssRes = ys.reduce((a, y, i) => a + (y - (slope * xs[i] + intercept)) ** 2, 0);
  const ssTot = ys.reduce((a, y) => a + (y - meanY) ** 2, 0);
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  return { slope, intercept, r2 };
}

/**
 * Compute the standard error of the regression residuals.
 */
function residualStdDev(
  xs: number[],
  ys: number[],
  reg: RegressionResult
): number {
  const n = xs.length;
  if (n < 3) return 0;
  const ssRes = xs.reduce(
    (a, x, i) => a + (ys[i] - (reg.slope * x + reg.intercept)) ** 2,
    0
  );
  return Math.sqrt(ssRes / (n - 2));
}

/**
 * Project forward N days from the end of a time series.
 * Returns projected points with ±1.5σ confidence bands.
 */
export function projectForward(
  lastDate: string,
  lastX: number,
  reg: RegressionResult,
  stdDev: number,
  days: number
): ProjectedPoint[] {
  const base = new Date(lastDate);
  const points: ProjectedPoint[] = [];

  for (let i = 1; i <= days; i++) {
    const x = lastX + i;
    const value = Math.max(0, reg.slope * x + reg.intercept);
    // Widen confidence band as we project further
    const spread = stdDev * 1.5 * Math.sqrt(1 + i / days);
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    points.push({
      day: d.toISOString().split("T")[0],
      value,
      upper: Math.max(0, value + spread),
      lower: Math.max(0, value - spread),
    });
  }
  return points;
}

/**
 * Compute a simple moving average over a window.
 */
export function movingAverage(values: number[], window: number): (number | null)[] {
  return values.map((_, i) => {
    if (i < window - 1) return null;
    const slice = values.slice(i - window + 1, i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

/**
 * Exponential moving average — gives more weight to recent data.
 */
export function exponentialMA(values: number[], span: number): number[] {
  const k = 2 / (span + 1);
  const result: number[] = [values[0]];
  for (let i = 1; i < values.length; i++) {
    result.push(values[i] * k + result[i - 1] * (1 - k));
  }
  return result;
}

/**
 * Compute compound growth rate over a period.
 * Uses first vs last N-day averages to smooth noise.
 */
export function growthRate(
  values: number[],
  windowDays = 7
): { daily: number; weekly: number; monthly: number; annualized: number } {
  if (values.length < windowDays * 2) {
    return { daily: 0, weekly: 0, monthly: 0, annualized: 0 };
  }
  const firstAvg =
    values.slice(0, windowDays).reduce((a, b) => a + b, 0) / windowDays;
  const lastAvg =
    values.slice(-windowDays).reduce((a, b) => a + b, 0) / windowDays;

  if (firstAvg === 0) return { daily: 0, weekly: 0, monthly: 0, annualized: 0 };

  const totalDays = values.length - windowDays;
  const dailyRate = (lastAvg / firstAvg) ** (1 / totalDays) - 1;

  return {
    daily: dailyRate * 100,
    weekly: ((1 + dailyRate) ** 7 - 1) * 100,
    monthly: ((1 + dailyRate) ** 30 - 1) * 100,
    annualized: ((1 + dailyRate) ** 365 - 1) * 100,
  };
}

/**
 * Build a full forecast dataset from time-series data.
 * Returns historical + projected points merged for charting.
 */
export function buildForecast(
  dates: string[],
  values: number[],
  forecastDays = 30
): {
  historical: { day: string; actual: number; trend: number }[];
  projected: ProjectedPoint[];
  regression: RegressionResult;
  growth: ReturnType<typeof growthRate>;
} {
  const xs = values.map((_, i) => i);
  const reg = linearRegression(xs, values);
  const stdDev = residualStdDev(xs, values, reg);
  const trend = xs.map((x) => Math.max(0, reg.slope * x + reg.intercept));

  const historical = dates.map((day, i) => ({
    day,
    actual: values[i],
    trend: trend[i],
  }));

  const projected = projectForward(
    dates[dates.length - 1],
    xs[xs.length - 1],
    reg,
    stdDev,
    forecastDays
  );

  const gr = growthRate(values);

  return { historical, projected, regression: reg, growth: gr };
}
