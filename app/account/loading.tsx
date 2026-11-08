export default function AccountLoading() {
  return (
    <main className="mx-auto min-h-[60vh] max-w-6xl px-5 py-16" aria-busy="true" aria-live="polite">
      <p className="text-xs uppercase tracking-[.2em] text-black/55">Loading account data · טוען נתוני חשבון</p>
      <div aria-hidden="true" className="mt-8 grid animate-pulse gap-5 md:grid-cols-3">
        <div className="h-32 rounded-2xl bg-black/5" />
        <div className="h-32 rounded-2xl bg-black/5" />
        <div className="h-32 rounded-2xl bg-black/5" />
      </div>
    </main>
  );
}
