# Claims Data Table (Next.js + TypeScript)

A small, responsive data table built from a Figma spec with **sorting**, **simple filters**, and **client-side pagination**.  
Populated with 200–300 rows of dummy data generated **at build time** and hosted on Vercel.

- **Live on Vercel:** <https://claims-datatable-k8ui28tt1-gadani-himan-gurusingas-projects.vercel.app/>
- **Figma (core state):** <https://www.figma.com/design/aXGS9SktFdGCTcOEubiGzt/Data-Table-Component?node-id=0-1&p=f&t=Kt9QbzLOtGT94OL5-0>

---

## Core Features (per assignment)

- **UI parity (core state):** spacing/typography/layout follow the provided Figma default state.
- **Loading & Empty states**
    - Loading: minimal spinner while data is fetched.
    - Empty: brief message + primary action to clear filters.
- **Data Table**
    - Columns: aligned to Figma (Name, Status, Service Date, Last Updated, plus auxiliary columns like Carrier, Amount, etc.).
    - **Sorting**: click header to sort **Name**, **Status**, **Service Date**, **Last Updated** (asc/desc).
    - **Filters**:
        - Text search on **Name** (“contains”, case-insensitive).
        - Status **single-select**: `REJECTED`, `PENDING`, `CALL`, `RESUBMITTED`.
    - **Pagination**: client-side; **Prev/Next** + **page size** select (`10 / 25 / 50`).
- **Dummy data**: 250 rows generated at build time with realistic distributions (dates, statuses, etc.).

---

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS
- **Table State (headless):** `@tanstack/react-table` (sorting/filtering/pagination row models only)
- **Utils:** `date-fns`, `clsx`
- **Dummy Data:** `@faker-js/faker`

> **Note on libraries:** No heavy data-grid components (e.g., AG Grid, MUI DataGrid).  
> TanStack Table is used **headlessly**—all rendering (headers, cells, states, pagination UI) is custom.

---

## Getting Started for Developers

### Prerequisites
- Node.js 18.17+ (or 20+)
- pnpm (recommended), or npm/yarn

### Install
```bash
pnpm install
```

### run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project StructureProject Structure

* .
* ├─ public/
* │  └─ claims.json                 # generated at (pre)build
* ├─ scripts/
* │  └─ generate-data.mjs           # faker-based dataset generator
* ├─ src/
* │  ├─ app/
* │  │  └─ page.tsx                 # page shell + dynamic DataTable
* │  ├─ components/
* │  │  ├─ DataTable.tsx            # table UI + state (sorting/filtering/pagination)
* │  │  ├─ Spinner.tsx              # loading indicator
* │  │  └─ Badge.tsx                # status/sync pills
* │  ├─ lib/
* │  │  └─ format.ts                # money/date formatters
* │  └─ types/index.ts                    # ClaimRow, Status types
* └─ tailwind.config.(js|ts)

## Architecture note

- App Router + Client fetch: The table is a Client Component that fetches /claims.json. This makes the loading/empty states straightforward and keeps the page static-friendly.
- Headless table state: @tanstack/react-table is used for row models (sorting/filtering/pagination). All DOM is bespoke to match Figma.
- Build-time data: scripts/generate-data.mjs (ESM) uses Faker (seeded for determinism) to produce 200–300 rows. Output is committed to public/ at build time and is not stored in source control.
- Accessibility: semantic table markup, focusable controls with labels, adequate contrast via Tailwind tokens.

## Performance
- Data size: ~250 rows; headless table ops are fast (no virtualization required).
- No unnecessary re-renders: derived state uses TanStack row models; formatting is pure functions.
- CSS is Tailwind utility-first; no runtime CSS-in-JS.

### Why Tanstack Table
This project uses @tanstack/react-table only as a headless state engine.
No data-grid UI components are used. This keeps implementation light, readable, and aligned with the requirement to avoid heavy data-grid libraries.