export function sampleTrace(trace, limit = 100) {
  if (limit <= 0 || trace.length === 0) return [];
  if (trace.length <= limit) return trace;
  if (limit === 1) return [trace[0]];

  return Array.from({ length: limit }, (_, index) => {
    const sampleIndex = Math.round((index * (trace.length - 1)) / (limit - 1));
    return trace[sampleIndex];
  });
}
