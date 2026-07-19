import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto flex max-w-7xl flex-col md:flex-row items-center justify-between gap-4 px-4 py-8 md:px-6">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-sm text-neutral-500">
          <p>© 2026 Airbnb Web App. All rights reserved.</p>
          <div className="flex items-center gap-4 mt-2 md:mt-0">
            <Link href="#" className="hover:underline">Privacy Policy</Link>
            <Link href="#" className="hover:underline">Terms</Link>
            <Link href="#" className="hover:underline">About</Link>
            <Link href="#" className="hover:underline">Contact</Link>
            <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
