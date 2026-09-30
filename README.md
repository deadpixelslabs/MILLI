# Hazels CTO Freemint

Mint website, wallet deployment studio and immutable onchain SVG collection for Robinhood Chain (4663).

- Collection: **Hazels CTO Freemint** (`HAZELS`). Supply: **5,555**.
- Free mint, network gas only. **2 lifetime mints per regular wallet**; transferring a token does not reset this count.
- Treasury and initial owner: **0x9d4B1bDF276a2B30F9FA95DB3beC0b40477c2941**. No treasury wallet limit; the collection supply and block gas limits still apply.
- Fixed **5% (500 bps)** ERC2981 royalty to the treasury, with owner-configurable Creator Token transfer validation.
- Immediate onchain SVG metadata. No image database or IPFS dependency. No upgrade or artwork replacement function.

## Run

Node 22 or newer (contract/browser tests currently require Linux x64 for the bundled Anvil binary):

```sh
npm ci
npm run build
npm run dev
```

Home `/` is the public mint page. `/deploy` is the browser deployment and owner management page. Both are responsive. Wallet discovery supports EIP-6963 and injected EVM wallets. On mobile, use the wallet's in-app browser.

## Deploy the website

Import this repository in Vercel. The committed `vercel.json` sets `npm run build`, output `dist`, `/deploy` routing and the read-only RPC function.

For public traffic, set server-only **`RPC_URL`** to your dedicated Robinhood Chain endpoint. The fallback public endpoint is rate-limited. Never put a private RPC key in a `VITE_` variable; these are compiled into the browser.

`public/site-config.json` intentionally starts with an empty collection address. The site does not claim minting is live or invent minted counts before deployment. Vercel publishing does not deploy blockchain contracts.

For another static host, route `/deploy` to `index.html` and set `VITE_READ_RPC_URL` to a public, browser-accessible RPC endpoint (or implement the included server proxy on that host).

## Deploy the collection

1. Open `/deploy` and connect the treasury wallet on chain **4663** with ETH for deployment gas.
2. Click **Deploy collection**. Approve the deployment transactions shown in the studio: **84 immutable artwork data contracts, the SVG renderer, and the NFT collection (86 total)**. The full approved illustrations contain over 10,000 SVG paths; their storage is intentionally not replaced by simplified drawings. Each artwork transaction stores up to 24 KB. Artwork hashes and contract runtime bytecode are checked before continuing.
3. Progress is saved after each transaction. Export the progress JSON as a backup. Resume with the same build, chain and wallet. A pending transaction is checked before another transaction is sent. Do not replace deployment transactions with unrelated transactions.
4. Download `site-config.json`. Replace **`public/site-config.json`** in this repository and publish the website. Alternatively set `VITE_COLLECTION_ADDRESS` and rebuild. A browser's local storage never configures the public website.
5. In the studio, read the deployed collection and click **Open minting**. This is a separate owner transaction. Minting is closed by default.
6. Confirm the public website shows the correct address and current mint state.

No private key is entered into the site. All transactions are signed in the connected wallet. Gas estimates appear in the wallet. A treasury mint may use any positive quantity up to remaining supply, subject to actual transaction gas; it can be split into multiple transactions.

## Artwork and rarity

The **three approved illustrations are retained in full**: twin buns with the ink hoodie, high ponytail with indigo denim, and side braid with the leather jacket. Every original path, face, strand, clothing fold and accessory remains intact. Token IDs **1, 2 and 3** render pixel-identically to the approved source SVGs. The prior hand-drawn replacement layers and NFT borders have been removed.

Variations use **12 hair palettes, 16 outfit palettes and 32 background settings**. Palette zero preserves the source colors. Hair, outfit and accessory silhouettes remain coupled within the three approved illustrations; this build does **not** claim 16 separately illustrated garments or 96 hairstyles. There are **5,555 distinct complete compositions**, including backgrounds in the uniqueness check. Token numbers and edition labels do not contribute to uniqueness.

Palette annotations never change vector geometry. They tint existing material paths while retaining shading; no image-generation service or database is used at mint time.

Fixed edition counts across the complete supply:

| Edition | Supply |
| --- | ---: |
| Signature | 4,166 |
| Rare | 1,111 |
| Legendary | 278 |

Edition is metadata only. It does not add a frame or badge to the approved artwork.

Allocation uses a public deterministic permutation. **Upcoming traits are predictable**. There is no hidden reveal, oracle randomness, rarity lottery, reroll or owner seed setter. Counts refer to the full collection; a partially minted collection may have a different distribution.

- `art/approved/`: the exact approved source illustrations, with recorded SHA-256 checksums.
- `art/regions.json`: material palette annotations bound to those source hashes.
- `scripts/classify-art.py`: optional region-authoring helper (`picosvg==0.22.3`). It changes annotations, never source geometry. Normal builds need only Node.
- `scripts/character-art.mjs`: deterministic assignments and the website SVG renderer.
- `scripts/prepare-art.mjs`: stores pre-encoded SVG bodies and palette tables in immutable data chunks, with per-chunk code hashes.
- `scripts/generate-renderer.mjs`: generates the Solidity renderer from the same trait definitions.
- `npm run art`: regenerates the artwork manifest and renderer source. Do not change a build midway through deployment.

Canonical metadata is a `data:application/json;utf8,` URI. Its `image` is a self-contained `data:image/svg+xml;base64,` URI assembled from the selected immutable artwork body and onchain palette styles. Base64 segment boundaries are padded to whole three-byte groups. JSON escapes `#` as `\u0023` so the outer data URI has no URL fragment. This avoids decompressing and double-encoding an entire detailed illustration every time a marketplace reads metadata.

Website WebP thumbnails are generated from the exact same SVG output. Tests compare decoded EVM image strings with the website generator, check all 5,555 assignments, compare all three original renders pixel-for-pixel, and load the real data URIs in a browser. No public-chain deployment or marketplace indexing is claimed by these local checks.

## Creator earnings enforcement

The collection implements ERC2981 and OpenSea's documented `ICreatorToken` interface. Ordinary transfers call the configured validator's `validateTransfer(caller, from, to, tokenId)` using selector `0xcaee23ea`. Minting does not call this transfer validator. Only the owner can set or clear the validator.

**A 5% royalty declaration does not by itself enforce payment.** Before activating enforcement:

1. Verify the official OpenSea-supported validator contract and its deployment on Robinhood Chain. The site intentionally does not guess a cross-chain address.
2. Set that validator using the studio or `setTransferValidator`.
3. Configure its transfer policy/authorizer and activate **Enforce earnings** in OpenSea Studio, if this chain and collection are supported there.
4. Verify a real compatible listing and sale after configuration. A validator setting alone is not reported as confirmed enforcement.

An incorrectly configured validator can block secondary transfers. The owner can recover by changing/clearing it; ownership transfer is two-step. Royalty percentage and treasury receiver are fixed. This source has automated tests, not an independent security audit.

Official integration: <https://docs.opensea.io/docs/creator-fee-enforcement>

## Etherscan verification

The studio downloads the full Solidity standard JSON input and build settings. Compile settings are **Solidity 0.8.26+commit.8a97fa7a**, optimizer **200**, **viaIR enabled**, EVM **Paris**.

Use standard JSON verification for `contracts/HazelsRenderer.sol:HazelsRenderer` and `contracts/HazelsCTOFreemint.sol:HazelsCTOFreemint`. Constructor arguments are, respectively, the ordered artwork address array, and the renderer address. Both appear in the deployment progress export. Raw data contracts contain STOP-prefixed bytes and do not have Solidity source.

The source package is generated at `/deployment/compiler-input.json`; it contains the pinned dependency sources. Keep the deployment progress and compiler input with the deployed collection.

## Verification

```sh
npm run build
npm test
npm run test:browser
```

Contract tests launch an isolated local EVM, deploy the actual build, verify all **5,555** onchain character assignments, mint to the actual cap, verify transfer-validator behavior, royalty math, lifetime wallet limits, treasury exemption, reentrancy, receiver rollback and metadata rendering. No public-chain transactions are submitted by the tests.

The browser test uses an isolated local wallet/RPC fixture to exercise deployment, resume, owner activation, free mint, wallet limits, network changes, mobile layout and failure states. Its state is never saved to public configuration. See `docs/validation.json` for the checked build's contract results.

Dependencies are pinned in `package-lock.json`. Solidity uses OpenZeppelin Contracts (MIT) and Solady (MIT). See `THIRD_PARTY_NOTICES.md`.
