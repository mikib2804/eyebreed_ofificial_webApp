export function SizeTable({ headers, rows, footnote }: { headers: readonly string[]; rows: readonly (readonly string[])[]; footnote: string }) {
  return <div>
    <div className="overflow-x-auto border border-white/20">
      <table dir="rtl" className="w-full min-w-[700px] border-collapse text-center text-[11px]">
        <thead><tr>{headers.map((h) => <th dir="rtl" key={h} className="border-b border-e-espresso-500/50 border-white/20 px-3 py-4 font-medium text-white/65">{h}</th>)}</tr></thead>
        <tbody>{rows.map((row) => <tr key={row[0]}>{row.map((cell, i) => <td dir="ltr" key={`${row[0]}-${i}`} className={`border-e border-t border-white/10 px-3 py-3 ${i === 0 ? "font-semibold text-espresso-400" : "text-white/85"}`}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
    <p className="mt-3 text-[10px] text-white/45">{footnote}</p>
  </div>;
}
