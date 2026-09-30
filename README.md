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
2. Click **Deploy collection**. Approve **4 deployment transactions**: two immutable artwork data contracts, the SVG renderer, and the NFT collection. Artwork hashes and contract runtime bytecode are checked before continuing.
3. Progress is saved after each transaction. Export the progress JSON as a backup. Resume with the same build, chain and wallet. A pending transaction is checked before another transaction is sent. Do not replace deployment transactions with unrelated transactions.
4. Download `site-config.json`. Replace **`public/site-config.json`** in this repository and publish the website. Alternatively set `VITE_COLLECTION_ADDRESS` and rebuild. A browser's local storage never configures the public website.
5. In the studio, read the deployed collection and click **Open minting**. This is a separate owner transaction. Minting is closed by default.
6. Confirm the public website shows the correct address and current mint state.

No private key is entered into the site. All transactions are signed in the connected wallet. Gas estimates appear in the wallet. A treasury mint may use any positive quantity up to remaining supply, subject to actual transaction gas; it can be split into multiple transactions.

## Artwork and rarity

The approved facial design is preserved as vector geometry. New modular layers provide **16 back hairstyles × 6 fringes, 16 outfits, 12 accessories, 12 hair colors, 12 outfit colors and 32 backgrounds**. The generator assigns **5,555 unique character tuples**, excluding background, token number and rarity from the uniqueness check. This is a shared-face generative collection, not 5,555 separately illustrated faces.

Fixed edition counts across the complete supply:

| Edition | Supply | Finish |
| --- | ---: | --- |
| Signature | 4,166 | Warm ivory |
| Rare | 1,111 | Gold |
| Legendary | 278 | Iridescent |

Allocation uses a public deterministic permutation. **Upcoming traits are predictable**. There is no hidden reveal, oracle randomness, rarity lottery, reroll or owner seed setter. Counts refer to the full collection; a partially minted collection may have a different distribution.

- `scripts/character-art.mjs`: original modular SVG layers, preview renderer and deterministic traits.
- `art/approved-face.svg`: registered crop of the approved facial artwork. `art/references/` preserves the art direction references.
- `scripts/prepare-art.mjs`: individually compresses and commits each layer to immutable artwork data.
- `scripts/generate-renderer.mjs`: generates Solidity renderer source from the same palette/name definitions.
- `npm run art`: regenerates the committed artwork manifest and renderer source. Rebuild and rerun tests after any artwork change. Do not change a build midway through deployment.

Canonical images are returned by `tokenURI` as onchain JSON and SVG data URIs. Website WebP thumbnails are generated from the exact same SVG renderer; they are previews, not the canonical NFT image. Tests compare SVG strings returned by the EVM against the website generator.

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
