export const CoinSide = {
  HEADS: 'HEADS',
  TAILS: 'TAILS',
} as const;

export type CoinSide = typeof CoinSide[keyof typeof CoinSide];

export interface CoinFlipResult {
  side: CoinSide;
  timestamp: number;
}
