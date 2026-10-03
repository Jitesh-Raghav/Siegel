'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Messages } from '@/messages/en'
import type { Locale } from '@/lib/i18n'
import { WaitlistForm } from './WaitlistForm'

type WaitlistContextValue = { open: (location: string) => void }

const WaitlistContext = createContext<WaitlistContextValue>({ open: () => {} })

export function useWaitlist() {
  return useContext(WaitlistContext)
}

export function WaitlistProvider({
  children,
  locale,
  t,
}: {
  children: ReactNode
  locale: Locale
  t: Messages['form']
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const [location, setLocation] = useState('modal')
  const [session, setSession] = useState(0)

  const open = useCallback((from: string) => {
    const dialog = dialogRef.current
    if (!dialog) return
    returnFocus.current = document.activeElement as HTMLElement | null
    setLocation(from)
    setSession((s) => s + 1)
    if (!dialog.open) dialog.showModal()
  }, [])

  const close = useCallback(() => dialogRef.current?.close(), [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const onClose = () => {
      returnFocus.current?.focus?.()
      returnFocus.current = null
    }
    // Close when the backdrop (the dialog element itself) is clicked.
    const onClick = (e: MouseEvent) => {
      if (e.target === dialog) dialog.close()
    }
    dialog.addEventListener('close', onClose)
    dialog.addEventListener('click', onClick)
    return () => {
      dialog.removeEventListener('close', onClose)
      dialog.removeEventListener('click', onClick)
    }
  }, [])

  return (
    <WaitlistContext.Provider value={{ open }}>
      {children}
      <dialog ref={dialogRef} className="waitlist-dialog" aria-labelledby="waitlist-title">
        <div className="relative bg-paper p-6 sm:p-9">
          <button
            type="button"
            onClick={close}
            className="absolute top-3 right-3 grid size-11 place-items-center rounded-[2px] text-muted transition-colors hover:text-ink"
            aria-label={t.close}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.25" />
            </svg>
          </button>
          <h2 id="waitlist-title" className="h3 pr-10">
            {t.title}
          </h2>
          <p className="lede mt-2 text-[15px]">{t.sub}</p>
          <div className="mt-6">
            <WaitlistForm key={session} locale={locale} t={t} location={location} autoFocus />
          </div>
        </div>
      </dialog>
    </WaitlistContext.Provider>
  )
}
