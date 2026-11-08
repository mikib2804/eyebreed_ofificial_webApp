"use client";

export default function AccountError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto grid min-h-[60vh] max-w-xl place-items-center px-5 py-16 text-center">
      <div role="alert">
        <h1 className="font-display text-5xl">Account data is unavailable</h1>
        <p className="mt-4 text-sm leading-7 text-black/65">We could not load this account page. לא הצלחנו לטעון את עמוד החשבון.</p>
        <button type="button" onClick={reset} className="mt-7 min-h-12 rounded-full bg-ink px-7 py-3 text-xs text-white">TRY AGAIN · נסו שוב</button>
      </div>
    </main>
  );
}
