# Release verification

0.1.0-beta, October 13, 2026.

Passed: 14 automated tests covering four stage/direction combinations plus adversarial route and fee checks; syntax/OpenAPI check; Worker bundle dry run; npm audit (zero vulnerabilities). SDK generation is offline and SDK code is not bundled into the Worker.

[Read-only mainnet evidence](evidence/read-only-mainnet.json) contains 3 successful real-protocol simulations. It records exactly which stages and directions were observed. Wallet addresses used for these simulations were public holders, not accounts controlled by us. No transaction was signed or submitted. Shared public RPC limits prevented complete discovery of fresh curve sell samples.

Deployment: prepared; live readback will be added after publication.

Limits: no funded trade tests or independent security audit. Local build measurements are isolated samples, not a latency SLA or confirmation benchmark. Fresh tokens can be absent from Jupiter, and historical migration configurations outside the supported set are rejected.
