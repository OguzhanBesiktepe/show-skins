# ShowSkins

**Live site: [show-skins.vercel.app](https://show-skins.vercel.app/)**

A full-stack CS2 / CS:GO skin browser that lets players browse, search, and **compare prices across multiple marketplaces** — all in one place. No more switching tabs between Steam, Skinport, CSFloat, and the wiki. Log in with Steam, save your favourites, and see pricing at a glance.

---

## Goal

Counter-Strike skins are traded on a large number of third-party marketplaces in addition to the official Steam Community Market. Each platform has its own fees, liquidity, and price floors, which means the "real" price of a skin is scattered across many tabs. ShowSkins solves this by:

- **Aggregating pricing data** from Steam and Skinport into a single detail view per skin
- Providing direct **marketplace links** so users can jump straight to a listing
- Displaying **inspect links** so users can check float values and patterns in-game before buying
- Letting logged-in users **favourite skins** to track items they care about over time

---

## Features

| Feature | Detail |
|---|---|
| Browse all skins | Grid of unique skins (48 per page, deduplicated by weapon + name) |
| Category navigation | Weapon-category dropdowns: Pistols, SMGs, LMGs, Shotguns, Rifles, Knives, Gloves |
| Search | Fuzzy search over all skin names, instant results |
| Skin detail page | Image, rarity, collection, description, pricing, marketplace links, inspect link |
| Price comparison | Lowest and median price from Skinport + Steam Market side-by-side |
| Inspect in-game | One-click Steam inspect link extracted from live market listings |
| Favourites | Save / remove skins; favourites page shows median price for saved items |
| Steam login | Full OpenID 2.0 flow — no password ever touches this server |
| Responsive UI | Desktop dropdowns + mobile hamburger drawer |
| Card effects | Per-card tilt and glare on hover for a tactile feel |

---

## Tech Stack

### Frontend
| Technology | Version | Role |
|---|---|---|
| Next.js | 16 (App Router) | Full-stack React framework |
| React | 19 | UI rendering |
| TypeScript | 5 | Type safety |
| Tailwind CSS | v4 | Utility-first styling |
| Lucide React | latest | Icon set |
| next/image | built-in | Optimised remote images |

### Backend / Persistence
| Technology | Role |
|---|---|
| Next.js API Routes | Server-side logic, proxying, auth callbacks |
| Upstash Redis | Persistent favourites storage (HTTP-based, serverless-friendly) |
| iron-session v8 | Encrypted HTTP-only session cookies |

---

## Data Sources & APIs

### 1. Skin Data — ByMykel CSGO-API
- **URL**: `https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins_not_grouped.json`
- Community-maintained, open JSON dump of every CS2 skin with metadata: weapon name, rarity, collection, flavour text, image URL, StatTrak availability, and more.
- Fetched fresh on every request so the skin catalogue is never stale.

### 2. Bulk Pricing — Skinport Public API
- **URL**: `https://api.skinport.com/v1/items?app_id=730&currency=USD`
- No API key required. Rate-limited to 8 requests / 5 minutes — acceptable because results are cached in-memory for **1 hour**.
- Returns every tradeable skin on Skinport with `min_price`, `median_price`, `quantity`, and a direct `item_page` link.
- Converted to a `Map<market_hash_name, item>`.

### 3. Per-Item Pricing Fallback — Steam Community Market
- **URL**: `https://steamcommunity.com/market/priceoverview/?appid=730&currency=1&market_hash_name={hash}`
- Only queried when a skin is not found in the Skinport bulk cache (rare edge cases).
- Returns `lowest_price`, `median_price`, `volume`.
- Cached in-memory per item for **30 minutes**. Includes automatic 429 retry with a 600 ms backoff.

### 4. Inspect Links — Steam Market Listings
- **URL**: `https://steamcommunity.com/market/listings/730/{hash}/render?...`
- Fetches the first active market listing and extracts its inspect-link template.
- Placeholders (`%listingid%`, `%assetid%`) are substituted with real values.
- Cached in **Redis** for **1 hour** so repeated page loads don't re-hit Steam.

### 5. Authentication — Steam OpenID 2.0
- Implemented manually against the Steam OpenID endpoint (no third-party library).
- After verification, the server fetches `personaname` and `avatarmedium` from the Steam Web API.
- Session stored as an encrypted HTTP-only cookie via iron-session — no session data lives in a database.

---

## Architecture

```
app/
├── page.tsx                              # Home — paginated skin grid
├── layout.tsx                            # Global layout: Navbar + Footer
├── browse/[category]/[weapon]/[skin]/
│   └── page.tsx                          # Skin detail page
├── favorites/
│   └── page.tsx                          # Saved favourites (requires auth)
│
├── components/
│   ├── Navbar.tsx                        # Server component shell
│   ├── NavDropdown.tsx                   # Hover weapon-category menus
│   ├── MobileNav.tsx                     # Mobile hamburger drawer
│   ├── SearchBar.tsx                     # Client: live fuzzy search
│   ├── SteamAuthArea.tsx                 # Client: login button / avatar menu
│   ├── SkinCard.tsx                      # Client: card with tilt + glare effect
│   ├── FavoriteButton.tsx                # Client: heart toggle (optimistic update)
│   ├── Pagination.tsx                    # Page prev/next controls
│   ├── Badge.tsx                         # Rarity + StatTrak badges
│   └── SkinCardSkeleton.tsx              # Loading skeleton
│
├── api/
│   ├── auth/steam/route.ts               # Redirect → Steam OpenID
│   ├── auth/steam/callback/route.ts      # Verify assertion, create session
│   ├── auth/me/route.ts                  # Return current user JSON
│   ├── auth/logout/route.ts              # Destroy session
│   ├── favorites/route.ts                # GET / POST / DELETE favourites
│   └── csfloat/route.ts                  # CSFloat proxy (inspect data)
│
└── lib/
    ├── bulk-prices.ts                    # Skinport bulk fetch + 1-hr in-memory cache
    ├── steammarket.ts                    # Steam per-item price + 30-min cache
    ├── csfloat.ts                        # Inspect-link extraction + Redis cache
    ├── session.ts                        # iron-session config + getSession()
    └── redis.ts                          # Upstash Redis client singleton
```

---

## Caching Strategy

Because pricing APIs have rate limits and latency, multiple caching layers are stacked:

| Resource | Source | Cache location | TTL |
|---|---|---|---|
| Skinport bulk prices | Skinport API | In-memory `Map` | 1 hour |
| Steam per-item price | Steam Market | In-memory `Map` | 30 min |
| Inspect links | Steam Listings | Upstash Redis | 1 hour |
| User session | iron-session | Encrypted HTTP cookie | Browser lifetime |
| Favourites | Upstash Redis | Redis hash | Persistent |

In-memory caches reset on server restart (acceptable for Next.js deployments); Redis caches survive restarts and are shared across instances.

---

## Challenges

### Rate limits everywhere
Steam Market and Skinport both enforce rate limits. The solution was to fetch Skinport's **full catalogue in a single bulk call** and cache it for an hour, so individual skin pages never hit the API directly. Steam is only called as a last resort for items missing from Skinport, with per-item in-memory caching and retry logic for 429 responses.

### Constructing market hash names
Every pricing API identifies skins by a `market_hash_name` string (e.g. `★ Karambit | Doppler (Minimal Wear)`). These strings had to be derived programmatically from the ByMykel skin metadata — accounting for knife and glove `★` prefixes, wear brackets, and StatTrak prefixes — with no central mapping provided.

### Steam OpenID without a library
Steam uses OpenID 2.0 in a non-standard way. The callback verification requires re-sending all assertion parameters back to Steam in `check_authentication` mode and confirming a positive response — all implemented by hand in the callback API route.

### URL slugification across three levels
Clean URLs like `/browse/rifles/ak-47/dragon-lore` require consistent slug generation for categories, weapons, and skin names — across every component that builds a link and every page that resolves it back to data. A mismatch anywhere produces a 404. The slugification logic (strip `★`, lowercase, replace non-alphanumeric with `-`) was centralised and reused throughout.

### Serverless-compatible persistence
Serverless environments don't support long-lived TCP connections, making traditional Redis clients unreliable. Upstash Redis is HTTP-based — every `hset` / `hgetall` is a plain HTTPS request with no connection pooling or IP whitelisting required.

### Mobile navigation layout
Fitting weapon-category navigation, a search bar, and an auth button into a mobile viewport without breaking layout required a separate `MobileNav` component with a drawer pattern and collapsible category lists, fully decoupled from the desktop hover-dropdown approach.

---

## Notable Implementation Details

- **Server components by default** — pages fetch data on the server; only interactive pieces (`SearchBar`, `SteamAuthArea`, `FavoriteButton`, `SkinCard`) are client components.
- **Optimistic UI** — `FavoriteButton` updates the heart icon immediately and syncs with the API in the background, so the UI never feels slow.
- **Parallel data fetching** — skin detail pages use `Promise.all()` to fetch Skinport prices, Steam prices, and the inspect link concurrently rather than sequentially.
- **Deduplication** — the home page maps skins by `weapon + normalised name` to eliminate duplicate wear-variant entries from the source data before display.
- **Glare + tilt card effect** — `SkinCard` tracks mouse position relative to the card and applies a CSS 3D perspective rotation plus a radial-gradient glare overlay, giving each card a holographic feel without any animation library.
- **Graceful degradation** — missing pricing data or a failed inspect-link fetch don't break the page; those sections simply don't render.

---

## Marketplaces Referenced

| Platform | Role in ShowSkins |
|---|---|
| Steam Community Market | Pricing fallback, inspect link extraction, official trading hub |
| Skinport | Primary bulk pricing source with direct listing links |
| CSFloat | Inspect-link infrastructure for float value checking |

More marketplace integrations (DMarket, Buff163, CS.Money, etc.) are a natural future extension — the pricing abstraction layer is designed to accommodate additional sources.

---

## Environment Variables

Create a `.env.local` file at the project root:

```env
STEAM_API_KEY=            # https://steamcommunity.com/dev/apikey
SESSION_SECRET=           # Any 32+ character random string
UPSTASH_REDIS_REST_URL=   # From console.upstash.com
UPSTASH_REDIS_REST_TOKEN= # From console.upstash.com
```

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
