import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  subtitle?: string
  /** Lucide icon shown in a colored box to the left of the title (notice-style) */
  icon?: LucideIcon
  /** href for the back navigation link */
  backHref?: string
  /** label for the back link — defaults to "대시보드로 돌아가기" */
  backLabel?: string
  /** small dark pill badge shown above the title (guide-style) */
  badge?: string
  /** secondary muted text shown beside the badge */
  badgeSub?: string
  /** optional right-side slot rendered inline with the title row */
  right?: React.ReactNode
  className?: string
}

export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  backHref,
  backLabel = "대시보드로 돌아가기",
  badge,
  badgeSub,
  right,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Back link */}
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 font-bold text-sm mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          {backLabel}
        </Link>
      )}

      {/* Badge row (above title when badge is provided) */}
      {badge && (
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-slate-800 text-white text-[10px] font-black uppercase tracking-wider">
            {badge}
          </span>
          {badgeSub && (
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              {badgeSub}
            </span>
          )}
        </div>
      )}

      {/* Title and right slot wrapper */}
      <div className={cn("flex items-start gap-4", right && "justify-between")}>
        <div>
          {/* Icon + Title row (when icon is provided) */}
          {Icon ? (
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-brand-primary shadow-sm shadow-orange-100">
                <Icon className="w-6 h-6" />
              </div>
              {title}
            </h1>
          ) : (
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              {title}
            </h1>
          )}

          {/* Subtitle */}
          {subtitle && (
            <p className={cn("text-lg font-medium text-slate-400", Icon && "ml-16")}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Right slot */}
        {right && <div>{right}</div>}
      </div>
    </div>
  )
}
