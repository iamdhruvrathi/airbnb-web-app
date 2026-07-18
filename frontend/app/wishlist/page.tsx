import { WishlistView } from "@/features/wishlist/wishlist-view";

export const metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <WishlistView />
    </div>
  );
}
