# Review

The build pipeline audits the bytes and accounts of a single Jupiter route and assembles account setup locally. It does not execute upstream setup instructions. Builds require an unsigned simulation, an exact fee check against the simulation event, and a final migration check. Unexpected protocol state or encodings fail closed.

Review found and fixed a route-handler shape mismatch inherited during integration. Account layouts now validate Anchor discriminators in addition to owners; SDK decoders alone skip some discriminators. Canonical pool identity is derived from the original curve and migration configuration. Unknown migration types are rejected.

Limits: official protocol programs and RPCs remain trust dependencies. Protocol upgrades can break the allowlist. This is internal code review, not an independent audit. Public test results do not replace funded testing.

Live checks also corrected the DBC aggregator label and validated legacy LaunchLab migrations using CPMM config 0 with the LaunchLab program-derived pool creator. A platform changing its preferred config must not make an unrelated pool trusted.

Clean-install CI found npm resolving a transitive file override relative to buffer-layout-utils instead of the repository. Fixed by declaring the local bigint-buffer adapter as a direct dependency and referencing it through npm's $bigint-buffer override. Fresh npm ci, all 14 tests, syntax/spec checks and a zero-vulnerability audit passed locally. Remote CI verifies the Linux Node 22/24 installs after push.

## Local website review — October 13, 2026

Reviewed the separate website, generated request examples and loopback-only preview server. Fixed zero slippage being silently replaced with the default. Public inputs stay text in the DOM and generated JavaScript; POSIX cURL values are shell-quoted. Preview requests reject private/unknown fields, incomplete quote bodies, foreign origins/hosts, oversized inputs and every transaction/build/approval endpoint. Only pinned-origin reads are forwarded; credentials are not forwarded. Clarified quote versus simulation versus submission, request timing versus confirmation, and funded-trade readiness. Browser QA uses mocked UI cases; actual read-only checks are separate. No contract or trading behavior changed.

## Follow-up review - October 13, 2026

Reviewed API input/RPC boundaries, stage classification, route or settlement construction, fee handling, local integration examples and the developer website. This was an internal review, not an independent security audit.

- Fixed a route-validation bypass: mere presence of the expected pool among remaining accounts did not prove that the DEX would use it. The expected writable pool is now required at the reviewed swap account position. A regression reproduces the old acceptance of a different pool with the expected one appended as an unused account; all supported variants and both directions are covered.
- Verified the positions against pinned official SDK account lists: DBC swap/swap2 pool offset 2, DAMM V2 swap/swap2 offset 1, LaunchLab buy/sell offset 4, and CPMM swap_base_input offset 3. The DEX account list begins at route_v2 index 12. Captured mainnet builds corroborate the current route layouts. Unknown variants still fail closed.

Verification: 22 tests passed; syntax/OpenAPI checks, Worker dry-run build and npm audit passed with zero reported vulnerabilities. Funded trading was not tested. See the release record for the deployment/readback status of this patch.
