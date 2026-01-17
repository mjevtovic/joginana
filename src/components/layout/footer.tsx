import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-sage-900 text-sage-300">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <span className="text-2xl font-display font-bold text-white">
              JoginAna
            </span>
            <p className="mt-4 text-sm">
              Transform your practice with personalized yoga sessions designed
              for your unique journey.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Practice</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/classes"
                  className="text-sm hover:text-white transition-colors"
                >
                  All Classes
                </Link>
              </li>
              <li>
                <Link
                  href="/planner"
                  className="text-sm hover:text-white transition-colors"
                >
                  Weekly Planner
                </Link>
              </li>
              <li>
                <Link
                  href="/favorites"
                  className="text-sm hover:text-white transition-colors"
                >
                  Favorites
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Company</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/pricing"
                  className="text-sm hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm hover:text-white transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-sm hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-sage-800 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} JoginAna. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
