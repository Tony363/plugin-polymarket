import {
  type Action,
  type IAgentRuntime,
  type Memory,
  type State,
  type Content,
  elizaLogger,
  HandlerCallback,
  logger
} from "@elizaos/core";
import { ClobService } from "../services/clobService";
import { SellSharesActionContent } from "../types";
import { GammaService } from "../services/gammaService";

export const sellSharesAction: Action = {
  name: "POLYMARKET_SELL_SHARES",
  similes: [
    "sell shares",
    "close position",
    "exit market",
    "place sell order"
  ],
  description: "Places an order to sell shares in a specific Polymarket outcome",
  examples: [
    [
      {
        name: "{{user1}}",
        content: { text: 'Sell 50 USD worth of YES shares in market 138462 at price 0.70' },
      },
      {
        name: "{{agent}}",
        content: { text: 'Order placed successfully! You have sold 50 USD worth of YES shares in "Will event X happen?" market at price $0.70 per share. Order ID: POLY-12345' },
      },
    ],
    [
      {
        name: "{{user1}}",
        content: { text: 'Close my position in market 138462' },
      },
      {
        name: "{{agent}}",
        content: { text: 'I need a few more details to place your sell order. Could you specify the outcome (YES/NO), amount you want to sell, and the price?' },
      },
    ],
  ],
  
  validate: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
  ): Promise<boolean> => {
    const content = message.content as SellSharesActionContent;
    if (!content || !content.text) {
      return false;
    }
    
    const text = content.text.toLowerCase();
    
    const hasSellKeywords = 
      text.includes("sell") || 
      text.includes("exit") || 
      text.includes("close position");
    
    const hasMarketKeywords =
      text.includes("market") ||
      text.includes("shares") ||
      text.includes("position") ||
      /\d{6}/.test(text); // Checks for market ID pattern
    
    return hasSellKeywords && hasMarketKeywords;
  },

  handler: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state: State,
    _options: any,
    callback: HandlerCallback,
    _responses: Memory[]
  ): Promise<string> => {
    const content = message.content as SellSharesActionContent;
    const text = content.text.trim();
    
    // Extract market ID
    const marketIdPattern = /\b\d{6}\b/;
    const marketIdMatch = text.match(marketIdPattern);
    const marketId = marketIdMatch ? marketIdMatch[0] : content.marketId;
    
    if (!marketId) {
      return "Sorry, I couldn't identify a market ID in your request. Please specify a market ID.";
    }
    
    // First fetch market details to verify market exists and to display details later
    const marketResult = await GammaService.fetchMarketById(marketId);
    if (!marketResult.success || !marketResult.market) {
      return `Sorry, I couldn't find a market with ID ${marketId}. ${marketResult.error || ''}`;
    }
    
    // Extract outcome (YES/NO)
    const outcomePattern = /\b(yes|no)\b/i;
    const outcomeMatch = text.match(outcomePattern);
    const outcome = outcomeMatch ? outcomeMatch[0].toUpperCase() : content.outcomeId;
    
    if (!outcome) {
      return `Please specify which outcome you want to sell (YES or NO) for market "${marketResult.market.question}".`;
    }
    
    // Extract amount
    const amountPattern = /\b(\d+(?:\.\d+)?)\s*(?:USD|USDC|dollars|$)?\b/;
    const amountMatch = text.match(amountPattern);
    const amount = amountMatch ? amountMatch[1] : content.amount;
    
    if (!amount) {
      return `Please specify the amount you want to sell of ${outcome} shares for market "${marketResult.market.question}".`;
    }
    
    // Extract price
    const pricePattern = /(?:price|at)\s*(?:\$)?(\d+(?:\.\d+)?)/i;
    const priceMatch = text.match(pricePattern);
    const price = priceMatch ? priceMatch[1] : content.price;
    
    if (!price) {
      return `Please specify the price at which you want to sell ${outcome} shares for market "${marketResult.market.question}".`;
    }
    
    // Log the extracted parameters for debugging
    logger.info(`Selling ${amount} USD of ${outcome} in market ${marketId} at price ${price}`);
    
    // Place the order through the CLOB API
    const result = await ClobService.placeOrder({
      marketId,
      outcomeId: outcome,
      side: 'SELL',
      amount,
      price,
      orderType: 'LIMIT'
    });
    
    const responseContent: Content = {
      text: result.success 
        ? `Order placed successfully! You have sold ${amount} USD worth of ${outcome} shares in market "${marketResult.market.question}" (ID: ${marketId}) at price $${price} per share. ${result.message || ''}`
        : `Sorry, there was an error placing your sell order: ${result.error}`
    };
    
    await callback(responseContent);
    
    return responseContent.text;
  }
};
