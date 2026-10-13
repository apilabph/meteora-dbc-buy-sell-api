# Standalone launchpad API

- Follow the parent API review, test, documentation and GitHub workflow. The owner authorized completing and publishing the volume-selected standalone APIs on October 13, 2026; funded trades remain for later user-run testing.
- This API is separate from Pump, RapidAPI and other launchpad repositories. Use the assigned public fee recipient from the local registry; never copy wallet keys or vault blobs here.
- Build unsigned transactions only. Validate market stage, program ownership, canonical migration destination, route bytes, fee amount, signer and simulation. Never sign or broadcast real trades.
- Fees must settle atomically with the swap and be disclosed. Unknown programs, unsupported mint extensions, incomplete migration and unverified fees must fail closed.
- Publish accurate beta status, measured checks and limits. Do not claim that a source push proves deployment or successful funded trading.

The owner requires customer-owned RPC for all application blockchain work. Customer mode runs reads/builds/simulations in the customer process; hosted chain endpoints must perform zero RPC calls. Require an explicit customer RPC with no implicit fallback. Keep the local signer and any routing credentials with the customer. Existing RapidAPI services are outside this migration.
