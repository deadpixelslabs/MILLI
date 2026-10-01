# MILLI — Milli For Million

A collection of **10,000 original pixel Doges**, launching on **Ethereum mainnet (chain ID 1)**. The public website, gallery, branding and metadata studio are dedicated to MILLI.

## Production endpoints

- Website: https://www.milliformillion.xyz/
- Metadata studio: https://www.milliformillion.xyz/deploy
- **Base URI:** `https://www.milliformillion.xyz/milli/metadata/`
- JSON: `/milli/metadata/1` or `/milli/metadata/1.json`, through token 10000.
- Images: `/milli/images/1.png`, through `/milli/images/10000.png`.
- Metadata CSV: `/milli/downloads/metadata.csv`.

The Base URI must retain its trailing slash. The source token IDs run from **1 to 10000**. Images and metadata are hosted on this domain and are public before minting. This is not onchain image storage.

## Source artwork and traits

Artwork and metadata were imported from `milli-for-million-10000.zip`. The second supplied archive is byte-identical. Source SHA-256: `8573c606ea28e762a85021c69251fd486f21eba81bc3a897a46c97edb0b8b963`.

All 10,000 decoded RGBA images and all 10,000 trait combinations are unique. Original images, names, token assignments and the six attribute categories are preserved. Placeholder IPFS image addresses are replaced with the actual hosted PNG URLs.

| Category | Variants |
| --- | ---: |
| Background | 6 |
| Doge Fur & Base | 7 |
| Outfit & Neckwear | 8 |
| Mouth & Snout Traits | 7 |
| Eyes & Visors | 6 |
| Headwear & Mohawk | 8 |

Counts include the original `None` options. The explorer filters all six categories, searches by ID/name/trait, and displays exact collection frequencies. It does not invent rarity rankings.

## Hosting implementation

`collection/milli/` stores a lossless tile dictionary, per-token tile indices, source metadata and a manifest. At build time `scripts/build-milli.mjs` reconstructs all PNGs and verifies every token's original pixel SHA-256. The PNGs are then served as static CDN files; no image reconstruction or database is required per request. This changes PNG compression only, not image pixels.

MILLI metadata endpoints read the small compressed metadata bundle. They validate token IDs, support GET/HEAD, return JSON 404s for invalid IDs and provide conditional ETag responses. The CSV endpoint reflects the same source records. Neither endpoint uses a private key or RPC.

## Launch configuration

`public/site-config.json` sets Ethereum chain ID 1, supply 10000 and the MILLI Base URI. The Ethereum collection address, official mint destination, mint price, launch date and wallet limits have **not been supplied**. The website therefore says **coming soon**, without a wallet connection or an active mint button. Configure the actual Ethereum collection separately before announcing minting as live. Existing Robinhood contract addresses are not Ethereum deployment addresses.

## Compatibility for already-minted NFTs

The older Hazels website is no longer displayed. Its already-minted tokens still reference `/metadata/:id` and `/images/...`. Those endpoints and the corresponding artwork generator are retained for token owners. They do not serve MILLI metadata. The public MILLI interface has no Hazels or Robinhood links.

Archived Solidity/deployment utilities in this repository belong to the previous collection and are not the MILLI Ethereum deployment flow. They are not executed by the website or standard build.

## Development and checks

```sh
npm ci
npm run build
npm test
npm run test:browser
```

The first build reconstructs 10,000 PNG images from the lossless bundle. Subsequent local builds reuse the verified manifest-matched output. Vercel builds from `main`; the generated static files are not duplicated in Git.
