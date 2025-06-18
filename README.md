# Plugin Polymarket

A plugin for ElizaOS that provides integration with Polymarket prediction markets data. This plugin enables AI agents to fetch and present real-time market data from Polymarket and execute trading operations.

## Overview

The Polymarket plugin provides actions to:
- Retrieve a list of active prediction markets from Polymarket
- Fetch specific market details by ID
- Filter markets by various criteria including search terms
- Buy shares in specific market outcomes
- Sell shares in specific market outcomes
- Redeem winnings from resolved markets

## Installation

```bash
# Add the plugin to your ElizaOS project
npm install plugin-polymarket
```

## Configuration

Create a `.env` file based on the provided `.env.example` template.

### API Keys

For trading operations, you need to obtain a Polymarket API key:

```
# Required for trading operations (buy/sell/redeem)
POLYMARKET_API_KEY=your_polymarket_api_key_here
```

No API key is required for basic market data access (read-only operations).

## Usage

### In ElizaOS

Import and register the plugin in your ElizaOS project:

```typescript
import pluginPolymarket from 'plugin-polymarket';

export const projectAgent: ProjectAgent = {
  character,
  init: async (runtime: IAgentRuntime) => await initCharacter({ runtime }),
  plugins: [pluginPolymarket],
};
```

### Available Actions

#### READ_POLYMARKET_MARKETS

Retrieves a list of active prediction markets, optionally filtered by search terms.

Example prompts:
- "Show me prediction markets"
- "Find prediction markets about crypto"
- "What are the top 5 markets on Polymarket?"

#### GET_POLYMARKET_MARKET_BY_ID

Fetches detailed information about a specific market by its ID.

Example prompts:
- "Show me details for Polymarket market 138462"
- "Get Polymarket data for market 138462"

#### POLYMARKET_BUY_SHARES

Places an order to buy shares in a specific market outcome.

Example prompts:
- "Buy 50 USD of YES shares in market 138462 at price 0.70"
- "Place a buy order for 100 USD of NO shares in market 138462 at 0.30"

#### POLYMARKET_SELL_SHARES

Places an order to sell shares in a specific market outcome.

Example prompts:
- "Sell 50 USD of YES shares in market 138462 at price 0.75"
- "Close my position in market 138462 by selling 30 USD of NO at 0.40"

#### POLYMARKET_REDEEM_WINNINGS

Redeems winnings from resolved markets.

Example prompts:
- "Redeem my winnings from market 138462"
- "Claim all my winnings from resolved markets"

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build the plugin
npm run build

# Run tests
npm test
```

## API Reference

This plugin uses the following Polymarket APIs:
- Gamma API: https://gamma-api.polymarket.com/markets (for market data)
- CLOB API: https://clob-api.polymarket.com (for trading operations)

### Documentation Links
- Gamma API: https://docs.polymarket.com/developers/gamma-markets-api/gamma-structure
- CLOB API: https://docs.polymarket.com/developers/CLOB/introduction

## License

This project is licensed under the terms specified in the package.json file.
