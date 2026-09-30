# Hazels CTO Freemint

5,555 detailed SVG portraits, a Vercel metadata server, and a collection website. Deploy the NFT contract through OpenSea; this project serves the artwork and metadata for instant reveal.

## Base URI

```
https://milliformillion.xyz/metadata/
```

Keep the trailing slash. The contract appends token IDs **1 through 5555**. Both `/metadata/1` and `/metadata/1.json` return JSON. The corresponding image is `/images/1.svg`.

- Studio and copy button: `/deploy`
- CSV: `/downloads/Hazels-CTO-Freemint-Metadata.csv`
- Metadata example: `/metadata/1`
- SVG example: `/images/1.svg`
- Last token: `/metadata/5555`

Metadata is available immediately and is public for all 5,555 IDs before minting. This is not a hidden rarity draw. The contract must return this Base URI for minted tokens instead of an unrevealed placeholder. Marketplace indexing can still take time.

**Artwork is hosted, not onchain.** Keep the domain and Vercel deployment available. The images do not depend on a database: each is reproduced byte-for-byte from the approved SVG paths and fixed palette assignments, with CDN caching. Every image is standalone SVG with no external fonts, images or scripts.

## Collection settings

Configure these in OpenSea when deploying and scheduling the drop:

- Name: **Hazels CTO Freemint**. Symbol: **HAZELS**.
- Supply: **5,555**. Planned public mint price: **0 ETH**, network gas applies.
- Planned public wallet limit: **2**.
- Treasury: **0x9d4B1bDF276a2B30F9FA95DB3beC0b40477c2941**.
- Planned creator earnings: **5%**, with enforcement configured in OpenSea Studio.

The metadata server does not enforce mint limits, treasury allocations, payments or royalties. These belong to the deployed contract and OpenSea settings. Treasury allocation needs to be configured there; the prior custom-contract treasury exemption is not automatically applied by this server.

After creating the drop, set `openseaUrl` in `public/site-config.json` to its HTTPS OpenSea URL to enable the website's collection link. Do not connect an OpenSea contract to the former custom-contract mint function.

## Artwork

Nine illustrated looks provide nine hairstyle and outfit designs. The original three remain unchanged at IDs 1–3. Six added designs introduce bob/bomber, fringe/varsity, wolf cut/blazer, low ponytail/cardigan, waves/utility vest and high bun/windbreaker. Hair and outfits are paired within each illustrated look. Six optional pin shapes and eight background motifs vary independently. The six new illustrations retain their authored hair and garment colors; palette changes apply to the original three looks. Background colors, motifs and pins vary across all nine. All 5,555 assignments are deterministic; Edition labels and their counts are retained. This expanded artwork updates the existing hosted collection without changing token IDs or ownership. OpenSea must reindex metadata to display the revised images; image URLs now use `/images/expanded/`.

Edition counts: **4,166 Signature**, **1,111 Rare**, **278 Legendary**. Edition labels are metadata only; they do not add frames or alter artwork.

- `art/approved/`: approved SVG originals.
- `art/regions.json`: material classifications bound to source checksums.
- `scripts/character-art.mjs`: fixed artwork generator and trait assignments.
- `server/metadata.mjs`: metadata and CSV definitions.
- `api/image.ts`, `api/metadata.ts`, `api/csv.ts`: Vercel endpoints.
- `scripts/export-collection.mjs`: produces all 5,555 individual SVG and JSON files for backup/export.

## Build and publish

Node 22 or newer:

```sh
npm ci
npm run build
npm test
npm run test:browser
```

Push to the existing Vercel-linked main branch. `vercel.json` includes approved artwork in the serverless functions and routes `/images/`, `/metadata/` and the CSV download. The server requires no wallet, RPC, database, private key or collection address to serve metadata.

`RPC_URL` is only used by the separate read-only RPC proxy retained in this repository. Do not put private RPC keys in public `VITE_` variables.

Generate the full export with:

```sh
npm run export:collection -- /absolute/output/directory
```

The export contains `images/1.svg` through `images/5555.svg`, matching JSON files, metadata rows and a SHA-256 manifest. A complete uncompressed SVG export is about 2.9 GB; the hosted server stores only the shared artwork and generator, not thousands of duplicated source files.

## Previous onchain implementation

The prior Solidity contracts, compilation tools and deployment helper remain in source history/current source for reference. They are not part of the active deployment flow and the website no longer offers the 86-transaction artwork deployment. Run `npm run test:onchain` only when deliberately working on that separate implementation.
