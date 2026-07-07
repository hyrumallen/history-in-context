// Which reigns get a vertical name label on the ribbon: only spans of at
// least 4 calendar years. reignIndex is the position in the FULL reign list
// so shade parity matches the per-cell strips.
export function labeledReigns(reigns) {
  return reigns
    .map((r, reignIndex) => ({ ...r, reignIndex }))
    .filter(r => r.endYear - r.startYear + 1 >= 4)
}
