import type { SitePage } from "@/components/mock-site";

// Where each interactive element takes you. Used by both the recorder
// (defining the path) and the participant runner (following it).
export function nextPage(page: SitePage, id: string): SitePage {
  if (id === "cart-icon") return "cart";
  if (page === "listing" && id === "card-trailhead") return "product";
  if (page === "product" && id === "add-to-cart") return "product"; // item added, stay
  if (page === "cart" && id === "checkout-cta") return "checkout";
  if (page === "checkout" && id === "place-order") return "done";
  return page;
}

// The canonical happy path for the hero scenario, in order.
export const happyPath: { id: string; label: string; page: SitePage; final?: boolean }[] = [
  { id: "nav-backpacks", label: "Open the Backpacks category", page: "listing" },
  { id: "card-trailhead", label: "Open the Trailhead 22L product page", page: "listing" },
  { id: "add-to-cart", label: "Click “Add to cart”", page: "product" },
  { id: "cart-icon", label: "Open the cart", page: "product" },
  { id: "checkout-cta", label: "Click “Proceed to checkout”", page: "cart" },
  { id: "place-order", label: "Place the order", page: "checkout", final: true },
];
