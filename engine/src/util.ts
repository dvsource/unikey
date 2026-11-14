/** Plain string order for deterministic tie-breaks. Internal. */
export const byId = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);
