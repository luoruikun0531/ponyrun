export function laneOrderKey(ponies) {
  return ponies.map((p) => p.id ?? p.colorKey ?? p.name).join('|');
}

export function shufflePoniesForLanes(ponies, rng, previousOrderKey = null) {
  const lanes = ponies.slice();
  for (let i = lanes.length - 1; i > 0; i--) {
    const j = rng.int(0, i);
    [lanes[i], lanes[j]] = [lanes[j], lanes[i]];
  }
  if (lanes.length > 1 && previousOrderKey && laneOrderKey(lanes) === previousOrderKey) {
    lanes.push(lanes.shift());
  }
  return lanes;
}
