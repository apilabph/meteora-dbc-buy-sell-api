export const config = {
  slug: "meteora-dbc-buy-sell-api",
  short: "Meteora DBC",
  name: "Meteora DBC Buy and Sell API",
  host: "meteora-dbc-trade",
  network: "Solana mainnet",
  native: "SOL",
  evm: false,
  needsMarket: true,
  accent: "#c9b6ff",
  port: 8811,
  fee: "DYjod9qNZvNu93yhdEw7pnASdt8FdghQF5WhEU7CgEXj",
  hero: "From the curve<br>to the pool.<br><span>Keep your keys.</span>",
  lead: "Build Meteora DBC buy and sell transactions with the current trading stage, a minimum output and your own local signer.",
  status:
    "Unsigned builds are available in beta. Read-only mainnet simulations passed; funded buys and sells have not been tested.",
  statusLabel: "Build beta",
  stage: "DBC → DAMM V2",
  coverage: [
    "SOL-paired Meteora dynamic bonding curves.",
    "Graduated DAMM V2 pools using the SDK-listed migration configurations.",
    "The original DBC curve address remains the reference after graduation.",
  ],
  limits: [
    "DAMM V1 and custom migration configurations.",
    "Non-SOL pairs and unsupported Token-2022 extensions.",
    "Pending migrations and routes not yet indexed by the upstream router.",
  ],
  evidence:
    "Recorded mainnet simulations cover a curve buy and graduated buy/sell. Fresh curve sell verification remains pending. No funded trades have been executed.",
  special:
    "Provide the original DBC curve address in market, even after graduation. It is different from the token mint and the graduated pool address.",
  api: "https://meteora-dbc-trade.apilabph.workers.dev",
  github: "https://github.com/apilabph/meteora-dbc-buy-sell-api",
};
