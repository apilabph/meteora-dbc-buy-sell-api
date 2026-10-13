# Meteora DBC Buy and Sell API

**Customer RPC mode:** run this API or import its client inside your own bot. All application blockchain RPC work uses your endpoint. Start with [the customer RPC guide](docs/CUSTOMER-RPC.md). The public site serves documentation; hosted trade/quote/market endpoints are retired in this release. Existing funded-test and settlement requirements remain.

Build unsigned buy and sell transactions for Meteora DBC tokens before and after graduation to DAMM V2. Your bot keeps its keys and signs locally. This is an independent integration, not an official Meteora product.

**Beta 0.1.0.** Automated checks cover input, routing and fee safeguards. Funded trades have not been tested. A successful simulation is a point-in-time check, not a guarantee of execution. See [release evidence](docs/RELEASE.md) for the exact deployment and live verification status.

[API documentation](https://meteora-dbc-trade.apilabph.workers.dev) · [OpenAPI](openapi.json) · [GitHub](https://github.com/apilabph/meteora-dbc-buy-sell-api)

## Quick start

First follow [local setup](docs/CUSTOMER-RPC.md): install Node 22 or 24, configure CUSTOMER_RPC_URL in ignored .dev.vars and start `npm run api:local`. No APILabPH API key is required.

```bash
curl http://127.0.0.1:8787/api/trade \
  -H "Content-Type: application/json" \
  -d '{"publicKey":"YOUR_PUBLIC_WALLET","mint":"TOKEN_MINT","market":"ORIGINAL_DBC_CURVE_ADDRESS","action":"buy","amount":"0.01","slippageBps":100,"maxServiceFeeBps":25}'
```

Replace the public wallet and token placeholders. The wallet needs SOL for input, gas and any account rent. This call returns an unsigned base64 transaction after simulation. Your bot must inspect, sign and submit it through its own RPC. The API never signs or broadcasts.

To sell, use `"action":"sell","amount":"1000000"`. Sell amounts are **raw token units**; buy amounts are decimal SOL strings. Use `/api/quote` with the same body for an estimate without constructing a transaction. Quotes are not simulated.

## What this builder checks

- The current curve stage, canonical destination and mint/program identity before construction, then the stage again after simulation.
- A single Jupiter route matching the verified market at the DEX pool account position, exact input, minimum output, signer and fee account. An expected pool appended as an unused account is rejected, as are unknown route encodings.
- The service fee in the simulation's own inner transfer and swap event. Concurrent fee deposits cannot distort this check.
- Existing wrapped-SOL accounts are preserved. If one already exists, sell proceeds remain in wrapped SOL.

SOL-paired Meteora DBC curves and their DAMM V2 migration pools using the SDK-listed migration configurations. Supply the original DBC curve address in `market`; it remains the reference after graduation. DAMM V1, custom migration configurations and unsupported Token-2022 extensions are rejected.

Migration-in-progress returns `MIGRATION_PENDING`. Rebuild after migration. New tokens may not yet be indexed by Jupiter; `ROUTE_UNAVAILABLE` does not mean the token is invalid. The API does not route through an unverified fallback.

## Fees

The service fee is **0.25% (25 basis points)**. On buys it is included in the requested SOL input; on sells it is deducted from actual SOL proceeds before the trader receives them. Fees are paid in wrapped SOL, atomically with the swap. Network and protocol fees are separate. If the fee receiving account does not exist, the first trader funds its rent; the response states the simulated rent separately.

Set `maxServiceFeeBps:25` to refuse a higher fee. A failed swap reverts the service transfer; the network may still charge its transaction fee. API calls alone do not earn trading fees. Forks of public code can change or remove the recipient.

## Run and maintain

```bash
npm ci --ignore-scripts
npm test
npm run check
npm run build:check
npm audit --audit-level=moderate
```

Run `npm run api:local` with CUSTOMER_RPC_URL and, when required, your own JUPITER_API_KEY in ignored .dev.vars. The local API has no signing endpoint. Never commit provider credentials or wallet keys.

The public Worker serves documentation and static metadata; chain endpoints return HTTP 410 CUSTOMER_RPC_REQUIRED. Market reads, simulation and trade preparation run in the customer process. Submission and confirmation use the customer’s signer and RPC. Jupiter routing is a separate dependency with its own access limits. Build latency and transaction confirmation are separate measurements; no uptime or speed guarantee is offered.

The SDKs are used offline to generate fixed account layouts. After a protocol change, regenerate them, review the official source and route IDL, run tests and repeat read-only simulations. This API has no RapidAPI association.

## Separate developer website (local review)

A redesigned website is ready for local review in [website/](website/README.md). Run `npm run site:preview`, then open http://127.0.0.1:8811. It includes a local request-code generator, three-language examples, fees, coverage and troubleshooting. Local browser and automated checks are documented in [website verification](docs/WEBSITE.md). The redesign has not been deployed and no custom domain is configured.
