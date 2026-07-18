import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4 md:px-6">
        <div>
          <h3 className="mb-4 font-semibold">Support</h3>
          <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
            <li><Link href="#">Help Center</Link></li>
            <li><Link href="#">AirCover</Link></li>
            <li><Link href="#">Cancellation options</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 font-semibold">Hosting</h3>
          <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
            <li><Link href="/host">Host your home</Link></li>
            <li><Link href="#">Hosting resources</Link></li>
            <li><Link href="#">Community forum</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 font-semibold">Airbnb</h3>
          <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
            <li><Link href="#">Newsroom</Link></li>
            <li><Link href="#">Careers</Link></li>
            <li><Link href="#">Investors</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 font-semibold">Demo</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            This is a clone built for a fullstack assignment. Payments, auth, and maps are mocked.
          </p>
        </div>
      </div>
      <div className="border-t border-neutral-200 px-4 py-6 dark:border-neutral-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-sm text-neutral-500 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Airbnb Clone. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
            <Link href="#">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
