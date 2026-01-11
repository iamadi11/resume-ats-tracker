/**
 * Performance Benchmarking
 * 
 * Tools for benchmarking scoring performance.
 */

interface BenchmarkResult {
  duration: number;
  memory?: number;
  iterations: number;
  average: number;
  min: number;
  max: number;
}

/**
 * Benchmark a function
 * 
 * @param fn - Function to benchmark
 * @param iterations - Number of iterations
 * @param warmup - Number of warmup iterations
 * @returns Benchmark results
 */
export async function benchmark(
  fn: () => Promise<any> | any,
  iterations: number = 10,
  warmup: number = 2
): Promise<BenchmarkResult> {
  const durations: number[] = [];

  // Warmup
  for (let i = 0; i < warmup; i++) {
    await fn();
  }

  // Benchmark
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const duration = performance.now() - start;
    durations.push(duration);
  }

  // Calculate statistics
  const sorted = durations.sort((a, b) => a - b);
  const average = durations.reduce((sum, d) => sum + d, 0) / durations.length;
  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  return {
    duration: average,
    iterations,
    average,
    min,
    max
  };
}

/**
 * Compare two functions
 * 
 * @param fn1 - First function
 * @param fn2 - Second function
 * @param iterations - Number of iterations
 * @returns Comparison results
 */
export async function compare(
  fn1: () => Promise<any> | any,
  fn2: () => Promise<any> | any,
  iterations: number = 10
) {
  const [result1, result2] = await Promise.all([
    benchmark(fn1, iterations),
    benchmark(fn2, iterations)
  ]);

  const improvement = ((result1.duration - result2.duration) / result1.duration) * 100;

  return {
    fn1: result1,
    fn2: result2,
    improvement: improvement > 0 ? `fn2 is ${improvement.toFixed(2)}% faster` : `fn1 is ${Math.abs(improvement).toFixed(2)}% faster`,
    faster: improvement > 0 ? 'fn2' : 'fn1'
  };
}

/**
 * Measure memory usage (if available)
 */
export function measureMemory(): number | null {
  if ('memory' in performance) {
    return (performance as any).memory.usedJSHeapSize;
  }
  return null;
}

