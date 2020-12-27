export const TRADE_TYPES = {
  BUY: 'buy',
  SELL: 'sell'
}

export const EVENTS = {
  TRADE: {
    TRADE_CREATED: 'trade_created',
    TRADE_UPDATED: 'trade_updated',
    TRADE_REMOVED: 'trade_removed',
  },
  HOLDING: {
    HOLDING_CREATED: 'holding_created',
    HOLDING_UPDATED: 'holding_updated',
    HOLDING_POSITIONS_UPDATED: 'holding_positions_updated',
  },
  USER: {
    USER_CREATED: 'user_created',
    USER_UPDATED: 'user_updated',
    USER_REMOVED: 'user_removed',
  }
}

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
}