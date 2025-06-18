# Plugin Polymarket Tests

This document provides specific information about the testing approach for the Polymarket plugin.

## Test Structure

The project uses a standardized testing approach that leverages core test utilities for consistency across the Eliza ecosystem.

### Core Test Utilities

The tests reuse core testing functionality from `@elizaos/core` through a set of utility functions:

- `runCoreActionTests` - Validates action structure and functionality
- `createMockRuntime` - Creates a standardized runtime for testing
- `createMockMessage` - Creates test messages for action testing
- `createMockState` - Creates test state objects

### Test Categories

The test suite covers:

1. **Actions Tests** - Testing the `READ_POLYMARKET_MARKETS` and `GET_POLYMARKET_MARKET_BY_ID` actions
2. **Service Tests** - Testing the `GammaService` functionality for API interactions
3. **Plugin Structure** - Validating the overall plugin configuration

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- actions.test.ts

# Run tests in watch mode
npm test -- --watch
```

## Polymarket-Specific Tests

### Action Tests

Tests for the Polymarket actions validate:

- Market list retrieval with various filter parameters
- Single market retrieval by ID
- Error handling for invalid inputs or API failures
- Response formatting for both actions

Example test case structure:

```typescript
describe('readMarketsAction', () => {
  it('should validate action structure', () => {
    expect(readMarketsAction.name).toBe('READ_POLYMARKET_MARKETS');
    expect(readMarketsAction.handler).toBeDefined();
    expect(readMarketsAction.validate).toBeDefined();
  });
  
  it('should retrieve and format active markets', async () => {
    const mockRuntime = createMockRuntime();
    const mockMessage = createMockMessage({
      text: 'Show me prediction markets'
    });
    const mockState = createMockState();
    
    const result = await readMarketsAction.handler(
      mockRuntime,
      mockMessage,
      mockState,
      {},
      mockCallback,
      []
    );
    
    expect(result).toContain('Here are the top');
  });
});
```

### GammaService Tests

Tests for the GammaService cover:

- API URL construction with various parameters
- Market data transformation 
- Pagination handling
- Error handling for API failures

Example test case structure:

```typescript
describe('GammaService', () => {
  it('should correctly build API URLs', () => {
    const url = GammaService._buildApiUrl({
      active: true,
      limit: 10,
      offset: 0
    });
    expect(url).toContain('active=true');
    expect(url).toContain('limit=10');
  });
  
  it('should transform raw market data', () => {
    const rawData = { /* mock data */ };
    const transformed = GammaService._transformMarketData(rawData);
    expect(transformed.id).toBeDefined();
    expect(transformed.question).toBeDefined();
    expect(transformed.outcomes).toBeInstanceOf(Array);
  });
});
```

## Mocking Strategy

When testing the Polymarket plugin, the following mocking approaches are used:

1. **API Responses** - Mock responses from the Polymarket Gamma API
2. **Runtime Services** - Mock ElizaOS runtime for action testing
3. **User Inputs** - Simulated user messages with various queries

## Writing New Tests

When adding new features to the Polymarket plugin, follow these guidelines:

1. Create dedicated tests for new actions or services
2. Mock any external API calls
3. Test both successful and error scenarios
4. Verify correct market data formatting
5. Ensure proper handling of user queries with different search terms
