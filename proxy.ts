import { NextResponse, type NextRequest } from 'next/server'

// English is served at the root, German under /de.
// Internally every page lives under app/[locale], so root paths are rewritten to /en.
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (pathname === '/de' || pathname.startsWith('/de/')) return NextResponse.next()

  if (pathname === '/en' || pathname.startsWith('/en/')) {
    // Metadata images are linked with their internal /en path; serve them as-is.
    if (pathname.includes('/opengraph-image') || pathname.includes('/twitter-image')) {
      return NextResponse.next()
    }
    const url = request.nextUrl.clone()
    url.pathname = pathname.slice(3) || '/'
    return NextResponse.redirect(url, 308)
  }

  const url = request.nextUrl.clone()
  url.pathname = `/en${pathname === '/' ? '' : pathname}`
  url.search = search
  return NextResponse.rewrite(url)
}

export const config = {
  // Skip API routes, the analytics proxy, Next internals and any file with an extension.
  matcher: ['/((?!api|ingest|_next|.*\\..*).*)'],
}
