export enum CoinSide {
  HEADS = 'HEADS',
  TAILS = 'TAILS',
}

export interface CoinFlipResult {
  side: CoinSide;
  timestamp: number;
}