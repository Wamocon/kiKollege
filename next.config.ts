import type { NextConfig } from 'next'

// Statischer Export: die Seite laeuft ohne Server und laesst sich sowohl intern
// ausliefern als auch spaeter auf GitHub Pages stellen, ohne dass etwas umgebaut wird.
// Fuer GitHub Pages unter wamocon.github.io/kiKollege muss BASE_PATH auf /kiKollege
// gesetzt werden, weil die Seite dann nicht in der Wurzel liegt.
const basePath = process.env.BASE_PATH ?? ''

const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: {
    // Steuert, welche Inhalte gerendert werden: "intern" zeigt alles,
    // "oeffentlich" filtert alles heraus, was das Uebergabedokument fuer eine
    // oeffentliche Seite ausschliesst. Siehe lib/freigabe.ts.
    NEXT_PUBLIC_FREIGABE: process.env.FREIGABE ?? 'intern',
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
}

export default nextConfig
