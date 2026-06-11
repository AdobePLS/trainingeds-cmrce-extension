#!/usr/bin/env node
/**
 * Read enriched order data from Adobe I/O State (same store as order-event-consumer).
 *
 * Usage:
 *   node scripts/read-order-state.js 2
 *   node scripts/read-order-state.js --list
 *
 * Requires .env with AIO_runtime_auth and AIO_runtime_namespace (from aio app deploy).
 */
const fs = require('fs');
const path = require('path');
const stateLib = require('@adobe/aio-lib-state');

function loadEnv () {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    return;
  }
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const eq = trimmed.indexOf('=');
    if (eq === -1) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

async function listOrderKeys (state) {
  const keys = [];
  for await (const batch of state.list({ match: 'order-*' })) {
    keys.push(...batch.keys);
  }
  return keys.sort();
}

async function readOrder (state, orderId) {
  const key = `order-${orderId}`;
  const record = await state.get(key);
  if (!record || record.value == null) {
    return null;
  }
  try {
    return { key, expiration: record.expiration, order: JSON.parse(record.value) };
  } catch {
    return { key, expiration: record.expiration, order: record.value };
  }
}

function formatOrderSummary (order) {
  const skus = (order.enrichment?.itemSummary || [])
    .map((item) => item.sku)
    .filter(Boolean);
  const currency = order.currency || 'USD';
  const price = order.grandTotal != null
    ? `${currency} ${order.grandTotal}`
    : 'N/A';

  return [
    `Order number: ${order.incrementId ?? order.orderId ?? 'N/A'}`,
    `Order tier: ${order.enrichment?.orderTier ?? 'N/A'}`,
    `Order price: ${price}`,
    `Product sku(s): ${skus.length ? skus.join(', ') : 'N/A'}`,
  ].join('\n');
}

async function main () {
  loadEnv();

  const auth = process.env.AIO_runtime_auth;
  const namespace = process.env.AIO_runtime_namespace;

  if (!auth || !namespace) {
    console.error('Missing AIO_runtime_auth or AIO_runtime_namespace in .env');
    console.error('Run from the project root after aio app deploy.');
    process.exit(1);
  }

  const state = await stateLib.init({
    ow: { auth, namespace },
  });

  const arg = process.argv[2];

  if (!arg || arg === '--list' || arg === '-l') {
    const keys = await listOrderKeys(state);
    if (keys.length === 0) {
      console.log('No order-* keys found in state.');
      console.log('Place an order in Commerce Admin to trigger order-event-consumer first.');
      return;
    }
    console.log(`Found ${keys.length} order key(s):\n`);
    for (const key of keys) {
      console.log(`  ${key}`);
    }
    console.log('\nFetch one: node scripts/read-order-state.js <orderId>');
    return;
  }

  const result = await readOrder(state, arg);
  if (!result) {
    console.error(`No data found for order-${arg}`);
    const keys = await listOrderKeys(state);
    if (keys.length > 0) {
      console.error('\nAvailable keys:');
      keys.forEach((k) => console.error(`  ${k}`));
    }
    process.exit(1);
  }

  console.log(formatOrderSummary(result.order));
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
