export function shufflePoniesForLanes(ponies, rng) {
  const lanes = ponies.slice();
  for (let i = lanes.length - 1; i > 0; i--) {
    const j = rng.int(0, i);
    [lanes[i], lanes[j]] = [lanes[j], lanes[i]];
  }
  return lanes;
}
