import { type Plugin } from '@elizaos/core';
import { GammaService } from './services/gammaService';
import { ClobService } from './services/clobService';
import { readMarketsAction } from './actions/readMarkets';
import { readMarketAction } from './actions/readMarket';
import { buySharesAction } from './actions/buyShares';
import { sellSharesAction } from './actions/sellShares';
import { redeemWinningsAction } from './actions/redeemWinnings';

const pluginPolymarket: Plugin = {
  name: 'plugin-polymarket',
  description: 'Plugin for Polymarket integration',
  actions: [
    readMarketsAction, 
    readMarketAction,
    buySharesAction,
    sellSharesAction,
    redeemWinningsAction
  ],
  services: [GammaService, ClobService],
};

export default pluginPolymarket;