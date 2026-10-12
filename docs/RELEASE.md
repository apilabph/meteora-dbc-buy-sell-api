# Release verification

0.1.0-beta, October 13, 2026.

Passed: 14 automated tests covering four stage/direction combinations plus adversarial route and fee checks; syntax/OpenAPI check; Worker bundle dry run; npm audit (zero vulnerabilities). SDK generation is offline and SDK code is not bundled into the Worker.

[Read-only mainnet evidence](evidence/read-only-mainnet.json) contains 3 successful real-protocol simulations. It records exactly which stages and directions were observed. Wallet addresses used for these simulations were public holders, not accounts controlled by us. No transaction was signed or submitted. Shared public RPC limits prevented complete discovery of fresh curve sell samples.

Deployment: public GitHub repository and https://meteora-dbc-trade.apilabph.workers.dev are live. Documentation, health and capabilities returned HTTP 200. Hosted mainnet buy construction returned HTTP 200 with a passed unsigned simulation at slot 456179943, 70510 compute units. Single observed round-trip: 1076 ms; this is not an SLA. Worker upload a4e9a5a2-9bf0-4e68-82bb-f6e7be6001dd; a subsequent secret-only deployment installed the existing Helius endpoint. Both new Solana services share that Helius project's quota.

The default public RPC returned rate-limit errors from Cloudflare, although it worked locally. Production now uses SOLANA_RPC_URL as a protected Worker secret. Its credential and local source file are not in GitHub. No paid upgrade was made. See [hosted evidence](evidence/hosted-mainnet.json).

Limits: no funded trade tests or independent security audit. Local build measurements are isolated samples, not a latency SLA or confirmation benchmark. Fresh tokens can be absent from Jupiter, and historical migration configurations outside the supported set are rejected.

Clean-install correction: the local bigint adapter is now a direct dependency with a root-relative npm override. Node 22/24 [CI passed](https://github.com/apilabph/meteora-dbc-buy-sell-api/actions/runs/38307546646). Latest Worker deployment after this packaging fix: c9d5cc86-9873-481d-a22a-260d16892f8e. Runtime bundle size is unchanged.

Final hosted readback after the packaging correction passed an unsigned buy simulation: [evidence](evidence/hosted-packaging-release.json).
