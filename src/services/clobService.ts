import { Service, IAgentRuntime, logger } from '@elizaos/core';
import { 
  OrderParams, 
  OrderResult,
  RedeemParams,
  RedeemResult
} from '../types';

/**
 * Service for interacting with Polymarket's Central Limit Order Book (CLOB) API
 * Handles trading operations like buying, selling and redeeming winnings
 */
export class ClobService extends Service {
  static serviceType = 'ClobService';
  static apiUrl = "https://clob-api.polymarket.com"; // Base URL for CLOB API

  static register(runtime: IAgentRuntime): IAgentRuntime {
    return runtime;
  }

  capabilityDescription = "Enables the agent to trade on Polymarket's CLOB API";

  constructor(protected runtime: IAgentRuntime) {
    super(runtime);
  }

  static async start(runtime: IAgentRuntime): Promise<ClobService> {
    const service = new ClobService(runtime);
    return service;
  }

  static async stop(runtime: IAgentRuntime): Promise<void> {
    const service = runtime.getService(ClobService.serviceType);
    if (!service) {
      throw new Error('CLOB service not found');
    }
    service.stop();
  }

  async stop() {}

  /**
   * Places an order to buy or sell shares
   * @param params - Parameters for the order
   * @returns Order result with success status and details
   */
  static async placeOrder(params: OrderParams): Promise<OrderResult> {
    // Get API key from environment variables
    const apiKey = process.env.POLYMARKET_API_KEY;
    
    if (!apiKey) {
      return {
        success: false,
        error: "API key not configured. Please set POLYMARKET_API_KEY in your environment."
      };
    }

    // Construct the order payload
    const payload = {
      marketId: params.marketId,
      outcomeId: params.outcomeId,
      side: params.side, // 'BUY' or 'SELL'
      size: params.amount,
      price: params.price,
      type: params.orderType || 'LIMIT' // Default to limit order
    };

    // Send the request
    let response;
    let data;
    
    response = await fetch(`${this.apiUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    }).catch(error => {
      logger.error("Network error in placeOrder:", error);
      return null;
    });

    if (!response) {
      return {
        success: false,
        error: "Network error while connecting to Polymarket API"
      };
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      return {
        success: false,
        error: `Order placement failed: ${response.status} ${errorText}`
      };
    }

    data = await response.json().catch(() => null);
    if (!data) {
      return {
        success: false,
        error: "Failed to parse API response"
      };
    }

    return {
      success: true,
      orderId: data.orderId,
      message: `Successfully placed ${params.side.toLowerCase()} order for ${params.amount} shares at $${params.price}`
    };
  }

  /**
   * Cancels an existing order
   * @param orderId - ID of the order to cancel
   * @returns Order cancellation result
   */
  static async cancelOrder(orderId: string): Promise<OrderResult> {
    const apiKey = process.env.POLYMARKET_API_KEY;
    
    if (!apiKey) {
      return {
        success: false,
        error: "API key not configured. Please set POLYMARKET_API_KEY in your environment."
      };
    }

    let response = await fetch(`${this.apiUrl}/orders/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    }).catch(error => {
      logger.error("Network error in cancelOrder:", error);
      return null;
    });

    if (!response) {
      return {
        success: false,
        error: "Network error while connecting to Polymarket API"
      };
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      return {
        success: false,
        error: `Order cancellation failed: ${response.status} ${errorText}`
      };
    }

    return {
      success: true,
      orderId: orderId,
      message: `Successfully cancelled order ${orderId}`
    };
  }

  /**
   * Redeems winnings from resolved markets
   * @param params - Parameters for redemption
   * @returns Redemption result
   */
  static async redeemWinnings(params: RedeemParams): Promise<RedeemResult> {
    const apiKey = process.env.POLYMARKET_API_KEY;
    
    if (!apiKey) {
      return {
        success: false,
        error: "API key not configured. Please set POLYMARKET_API_KEY in your environment."
      };
    }

    // Construct the redeem payload
    const payload = params.marketId ? { marketId: params.marketId } : {};

    let response = await fetch(`${this.apiUrl}/redeem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    }).catch(error => {
      logger.error("Network error in redeemWinnings:", error);
      return null;
    });

    if (!response) {
      return {
        success: false,
        error: "Network error while connecting to Polymarket API"
      };
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      return {
        success: false,
        error: `Redemption failed: ${response.status} ${errorText}`
      };
    }

    const data = await response.json().catch(() => null);
    if (!data) {
      return {
        success: false,
        error: "Failed to parse API response"
      };
    }
    
    return {
      success: true,
      amount: data.amount,
      message: `Successfully redeemed winnings: ${data.amount} USDC`
    };
  }
}
