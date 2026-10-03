import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="container-ledger flex min-h-[60vh] flex-col items-start justify-center py-24">
      <p className="mono-label text-muted">404</p>
      <h1 className="h2 mt-4">This page isn’t on file.</h1>
      <p className="lede mt-4">Diese Seite existiert nicht.</p>
      <Link href="/" className="btn btn-secondary mt-8">
        Siegel
      </Link>
    </main>
  )
}
