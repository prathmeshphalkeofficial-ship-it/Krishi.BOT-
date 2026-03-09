// ─────────────────────────────────────────────────────────────────
// ADD THIS IMPORT at the top of app/news/page.tsx
// (add next to your existing imports)
// ─────────────────────────────────────────────────────────────────
import Link from "next/link"

// ─────────────────────────────────────────────────────────────────
// ADD THIS BUTTON inside your mandi tab, just ABOVE the
// "space-y-2" div that lists all the commodity rows.
// Find this line:   <div className="space-y-2">
// And ADD this just before it:
// ─────────────────────────────────────────────────────────────────

<Link
  href="/mandi/history"
  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 mb-3 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl transition-colors"
>
  <TrendingUp className="h-4 w-4 text-primary" />
  <span className="text-xs font-semibold text-primary">
    {t("📈 View 30-Day Price History Charts", "📈 30 दिन का मूल्य इतिहास देखें", "📈 ३० दिवसांचा किंमत इतिहास पाहा")}
  </span>
</Link>

// ─────────────────────────────────────────────────────────────────
// THAT'S IT — only 1 import + 1 button block to add to news/page.tsx
// Everything else stays exactly the same!
// ─────────────────────────────────────────────────────────────────