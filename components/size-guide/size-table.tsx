export function SizeTable({ headers, rows, footnote }: { headers: readonly string[]; rows: readonly (readonly string[])[]; footnote: string }) {
  return <div>
    <div className="grid gap-3 sm:hidden">
      {rows.map((row) => <article key={row[0]} className="border border-white/20 bg-white/[.025] p-4">
        <div className="flex items-center justify-between border-b border-white/15 pb-3"><span className="text-[10px] text-white/75">מידה</span><strong dir="ltr" className="font-display text-2xl text-espresso-400">{row[0]}</strong></div>
        <dl className="mt-3 grid grid-cols-2 gap-x-5 gap-y-3">
          {row.slice(1).map((cell, index) => <div key={`${row[0]}-${index}`} className="min-w-0 border-b border-white/10 pb-2"><dt dir="rtl" className="text-[9px] leading-4 text-white/75">{headers[index + 1]}</dt><dd dir="ltr" className="mt-1 text-sm text-white">{cell} <span className="text-[9px] text-white/75">CM</span></dd></div>)}
        </dl>
      </article>)}
    </div>
    <div className="hidden overflow-x-auto border border-white/20 sm:block">
      <table dir="rtl" className="w-full min-w-[700px] border-collapse text-center text-[11px]">
        <thead><tr>{headers.map((h) => <th dir="rtl" key={h} className="border-b border-e-espresso-500/50 border-white/20 px-3 py-4 font-medium text-white/75">{h}</th>)}</tr></thead>
        <tbody>{rows.map((row) => <tr key={row[0]}>{row.map((cell, i) => <td dir="ltr" key={`${row[0]}-${i}`} className={`border-e border-t border-white/10 px-3 py-3 ${i === 0 ? "font-semibold text-espresso-400" : "text-white/85"}`}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
    <p dir="rtl" className="mt-3 text-[10px] leading-5 text-white/75">{footnote}</p>
  </div>;
}
