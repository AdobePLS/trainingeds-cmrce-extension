const { Core } = require('@adobe/aio-sdk');
const stateLib = require('@adobe/aio-lib-state');

async function main (params) {
  const logger = Core.Logger('read-order-state', {
    level: params.LOG_LEVEL || 'info',
  });

  try {
    const orderId = params.orderId || params.order_id;
    const state = await stateLib.init();

    if (!orderId) {
      const keys = [];
      for await (const batch of state.list({ match: 'order-*' })) {
        keys.push(...batch.keys);
      }
      logger.info(`Listed ${keys.length} order key(s)`);
      return {
        statusCode: 200,
        body: {
          message: 'Pass ?orderId=<id> to fetch one order, or use keys below',
          keys: keys.sort(),
        },
      };
    }

    const key = `order-${orderId}`;
    const record = await state.get(key);

    if (!record || record.value == null) {
      logger.warn(`No state found for key: ${key}`);
      return {
        statusCode: 404,
        body: {
          error: 'Order not found in state',
          key,
          hint: 'Call without orderId to list available order-* keys',
        },
      };
    }

    let order;
    try {
      order = JSON.parse(record.value);
    } catch {
      order = record.value;
    }

    logger.info(`Retrieved state for ${key}`);

    return {
      statusCode: 200,
      body: {
        key,
        expiration: record.expiration,
        order,
      },
    };
  } catch (error) {
    logger.error('Failed to read order state:', error.message, error.stack);
    return {
      statusCode: 500,
      body: { error: 'Failed to read order state' },
    };
  }
}

exports.main = main;
