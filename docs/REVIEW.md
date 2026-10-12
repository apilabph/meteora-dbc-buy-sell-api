# Review

The build pipeline audits the bytes and accounts of a single Jupiter route and assembles account setup locally. It does not execute upstream setup instructions. Builds require an unsigned simulation, an exact fee check against the simulation event, and a final migration check. Unexpected protocol state or encodings fail closed.

Review found and fixed a route-handler shape mismatch inherited during integration. Account layouts now validate Anchor discriminators in addition to owners; SDK decoders alone skip some discriminators. Canonical pool identity is derived from the original curve and migration configuration. Unknown migration types are rejected.

Limits: official protocol programs and RPCs remain trust dependencies. Protocol upgrades can break the allowlist. This is internal code review, not an independent audit. Public test results do not replace funded testing.

Live checks also corrected the DBC aggregator label and validated legacy LaunchLab migrations using CPMM config 0 with the LaunchLab program-derived pool creator. A platform changing its preferred config must not make an unrelated pool trusted.
