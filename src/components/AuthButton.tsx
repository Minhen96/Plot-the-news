'use client'

import { usePrivy } from '@privy-io/react-auth'

export default function AuthButton() {
  const { ready, authenticated, login, logout, user } = usePrivy()

  if (!ready) {
    return (
      <span className="text-[10px] font-label font-bold uppercase tracking-widest opacity-30">
        ...
      </span>
    )
  }

  if (authenticated) {
    const address = user?.wallet?.address
    const short = address
      ? `${address.slice(0, 6)}…${address.slice(-4)}`
      : user?.email?.address?.split('@')[0] ?? 'Signed in'

    return (
      <button
        onClick={logout}
        className="text-[10px] font-label font-bold uppercase tracking-widest text-primary hover:opacity-70 transition-opacity"
        title={address ?? 'Sign out'}
      >
        {short}
      </button>
    )
  }

  return (
    <button
      onClick={login}
      className="text-[10px] font-label font-bold uppercase tracking-widest opacity-70 hover:opacity-100 hover:text-primary transition-all"
    >
      Sign In
    </button>
  )
}
