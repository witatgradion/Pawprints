"use client";

import { cn } from "@/lib/cn";

/* A stand-in for the proxied target site (acme.store). Deliberately neutral
   (slate/stone, not Empathy's brand) so it reads as "the site under test."
   Every interactive surface calls onHit(id, label) and every other surface
   calls onMiss(label) — that split is exactly what a real injected tracker
   does to separate on-path progress from misclicks. */

export type SitePage = "listing" | "product" | "cart" | "checkout" | "done";

type Props = {
  page: SitePage;
  onHit: (id: string, label: string, e: React.MouseEvent) => void;
  onMiss: (label: string, e: React.MouseEvent) => void;
  highlight?: string | null; // element id to pulse (recorder confirmation / hints)
  host?: string; // domain shown in the browser chrome (defaults to the stand-in)
};

const pathFor: Record<SitePage, string> = {
  listing: "/c/backpacks",
  product: "/p/trailhead-22l",
  cart: "/cart",
  checkout: "/checkout",
  done: "/order/confirmed",
};

export function MockSite({ page, onHit, onMiss, highlight, host = "acme.store" }: Props) {
  // brand wordmark derived from the host (e.g. "caminoninja.com" → "caminoninja" + ".com")
  const brand = host.replace(/^www\./, "");
  const dotAt = brand.indexOf(".");
  const hit = (id: string, label: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onHit(id, label, e);
  };
  const miss = (label: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onMiss(label, e);
  };
  const ring = (id: string) =>
    highlight === id ? "outline outline-2 outline-offset-2 outline-brand animate-pulse" : "";

  return (
    <div className="flex h-full flex-col bg-white text-[#1c2230]" onClick={miss("background")}>
      {/* browser chrome */}
      <div className="flex items-center gap-2 border-b border-stone-200 bg-stone-100 px-3 py-2">
        <span className="flex gap-1.5">
          <i className="size-2.5 rounded-full bg-stone-300" />
          <i className="size-2.5 rounded-full bg-stone-300" />
          <i className="size-2.5 rounded-full bg-stone-300" />
        </span>
        <div className="ml-2 flex-1 truncate rounded-md bg-white px-3 py-1 font-mono text-[11px] text-stone-500">
          {host}{pathFor[page]}
        </div>
      </div>

      {/* site header */}
      <header className="flex items-center justify-between border-b border-stone-200 px-5 py-3" onClick={miss("header")}>
        <div className="flex items-center gap-5">
          <span className="text-base font-bold tracking-tight">
            {dotAt > 0 ? (
              <>{brand.slice(0, dotAt)}<span className="text-emerald-600">{brand.slice(dotAt)}</span></>
            ) : (
              brand
            )}
          </span>
          <nav className="hidden items-center gap-4 text-[13px] text-stone-600 sm:flex">
            <button onClick={hit("nav-backpacks", "Backpacks nav link")} className={cn("rounded px-1 hover:text-stone-900", ring("nav-backpacks"))}>Backpacks</button>
            <button onClick={miss("Tents nav link")} className="rounded px-1 hover:text-stone-900">Tents</button>
            <button onClick={miss("Apparel nav link")} className="rounded px-1 hover:text-stone-900">Apparel</button>
            <button onClick={miss("Sale nav link")} className="rounded px-1 hover:text-stone-900">Sale</button>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={miss("Search")} aria-label="Search" className="text-stone-500 hover:text-stone-900">⌕</button>
          {/* the infamous cart icon */}
          <button
            onClick={hit("cart-icon", "Cart icon")}
            className={cn("relative rounded-md p-1.5 hover:bg-stone-100", ring("cart-icon"))}
            aria-label="Cart"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M3 4h2l2.2 11.2a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.8L20 7H6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="20" r="1.3" /><circle cx="18" cy="20" r="1.3" />
            </svg>
            <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-emerald-600 text-[9px] font-bold text-white">1</span>
          </button>
        </div>
      </header>

      {/* page body */}
      <div className="flex-1 overflow-auto px-5 py-5" onClick={miss("page body")}>
        {page === "listing" && <Listing hit={hit} miss={miss} ring={ring} />}
        {page === "product" && <Product hit={hit} miss={miss} ring={ring} />}
        {page === "cart" && <CartPage hit={hit} miss={miss} ring={ring} />}
        {page === "checkout" && <Checkout hit={hit} miss={miss} ring={ring} />}
        {page === "done" && <Done />}
      </div>

      {/* footer */}
      <footer className="border-t border-stone-200 px-5 py-3 text-[11px] text-stone-500" onClick={miss("footer")}>
        <button onClick={hit("footer-returns", "Returns & refunds link")} className="hover:text-stone-800 hover:underline">Returns &amp; refunds</button>
        <span className="mx-2">·</span>
        <button onClick={miss("Help footer link")} className="hover:text-stone-800 hover:underline">Help</button>
        <span className="mx-2">·</span>
        <button onClick={miss("Privacy footer link")} className="hover:text-stone-800 hover:underline">Privacy</button>
      </footer>
    </div>
  );
}

type Helpers = {
  hit: (id: string, label: string) => (e: React.MouseEvent) => void;
  miss: (label: string) => (e: React.MouseEvent) => void;
  ring: (id: string) => string;
};

function Swatch({ tone = "stone" }: { tone?: string }) {
  const map: Record<string, string> = { stone: "from-stone-200 to-stone-300", emerald: "from-emerald-100 to-emerald-200", sky: "from-sky-100 to-sky-200", amber: "from-amber-100 to-amber-200" };
  return <div className={cn("aspect-[4/3] w-full rounded-lg bg-gradient-to-br", map[tone])} />;
}

function Listing({ hit, miss, ring }: Helpers) {
  const others = [
    { id: "card-summit", name: "Summit 40L", price: "$129", tone: "emerald" },
    { id: "card-daybreak", name: "Daybreak Sling", price: "$59", tone: "sky" },
    { id: "card-ranger", name: "Ranger 30L", price: "$109", tone: "amber" },
  ];
  return (
    <div>
      <h1 className="text-xl font-bold">Backpacks</h1>
      <p className="mt-1 text-[13px] text-stone-500">12 products</p>
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <button onClick={hit("card-trailhead", "Trailhead 22L product card")} className={cn("group rounded-xl border border-stone-200 p-3 text-left hover:border-stone-400", ring("card-trailhead"))}>
          <Swatch tone="stone" />
          <div className="mt-2.5 text-sm font-semibold">Trailhead 22L</div>
          <div className="text-[13px] text-stone-500">$89</div>
        </button>
        {others.map((o) => (
          <button key={o.id} onClick={miss(`${o.name} product card`)} className="rounded-xl border border-stone-200 p-3 text-left hover:border-stone-400">
            <Swatch tone={o.tone} />
            <div className="mt-2.5 text-sm font-semibold">{o.name}</div>
            <div className="text-[13px] text-stone-500">{o.price}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Product({ hit, miss, ring }: Helpers) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <button onClick={hit("product-image", "Product image")} className={cn("block", ring("product-image"))}>
        <Swatch tone="stone" />
      </button>
      <div>
        <h1 className="text-2xl font-bold">Trailhead 22L</h1>
        <div className="mt-1 text-lg font-semibold">$89</div>
        <p className="mt-3 text-[13px] leading-relaxed text-stone-600">
          A do-everything daypack with a padded laptop sleeve, weather-resistant
          shell, and an aggressively quiet color story.
        </p>
        <div className="mt-5 flex gap-2">
          <button onClick={miss("Color: slate swatch")} className="size-7 rounded-full border-2 border-stone-900 bg-stone-400" aria-label="Slate" />
          <button onClick={miss("Color: moss swatch")} className="size-7 rounded-full border border-stone-300 bg-emerald-300" aria-label="Moss" />
        </div>
        <button
          onClick={hit("add-to-cart", "Add to cart button")}
          className={cn("mt-6 w-full rounded-lg bg-stone-900 py-3 text-sm font-semibold text-white hover:bg-stone-800", ring("add-to-cart"))}
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}

function CartPage({ hit, miss, ring }: Helpers) {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-bold">Your cart</h1>

      {/* the banner that looks clickable but isn't a real control */}
      <div
        onClick={miss("“Save 15% this week” promo banner")}
        className={cn("mt-4 cursor-pointer rounded-lg bg-amber-100 px-4 py-2.5 text-[13px] font-medium text-amber-800", ring("promo-banner"))}
      >
        ★ Save 15% this week — limited time
      </div>

      <div className="mt-4 flex items-center gap-4 rounded-xl border border-stone-200 p-3">
        <div className="size-16 shrink-0 rounded-lg bg-gradient-to-br from-stone-200 to-stone-300" />
        <div className="flex-1">
          <div className="text-sm font-semibold">Trailhead 22L</div>
          <div className="text-[13px] text-stone-500">Slate · Qty 1</div>
        </div>
        <div className="text-sm font-semibold">$89.00</div>
      </div>

      <div className="mt-4 space-y-1.5 text-[13px] text-stone-600">
        <div className="flex justify-between"><span>Subtotal</span><span>$89.00</span></div>
        <div className="flex justify-between"><span>Estimated shipping</span><span className="text-stone-400">calculated at checkout</span></div>
      </div>

      {/* primary CTA, low-contrast and below the summary — the design flaw */}
      <button
        onClick={hit("checkout-cta", "Proceed to checkout button")}
        className={cn("mt-5 w-full rounded-lg border border-stone-300 bg-white py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50", ring("checkout-cta"))}
      >
        Proceed to checkout
      </button>
    </div>
  );
}

function Checkout({ hit, miss, ring }: Helpers) {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-xl font-bold">Checkout</h1>
      <div className="mt-4 space-y-3">
        {["Email", "Shipping address", "Card number"].map((f) => (
          <div key={f} onClick={miss(`${f} field`)}>
            <div className="text-[12px] font-medium text-stone-500">{f}</div>
            <div className="mt-1 h-9 rounded-lg border border-stone-200 bg-stone-50" />
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between border-t border-stone-200 pt-3 text-sm font-semibold">
        <span>Total</span><span>$96.50</span>
      </div>
      <button
        onClick={hit("place-order", "Place order button")}
        className={cn("mt-5 w-full rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700", ring("place-order"))}
      >
        Place order
      </button>
    </div>
  );
}

function Done() {
  return (
    <div className="grid h-full place-items-center py-10 text-center">
      <div>
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-2xl text-emerald-600">✓</div>
        <h1 className="mt-4 text-xl font-bold">Order confirmed</h1>
        <p className="mt-1 text-[13px] text-stone-500">Thanks! A receipt is on its way.</p>
      </div>
    </div>
  );
}
