export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-ink/10 border-y border-ink/10">
      {items.map((item) => (
        <details key={item.q} className="group py-4">
          <summary className="flex cursor-pointer items-start justify-between gap-6 font-medium">
            {item.q}
            <span aria-hidden="true" className="text-xl leading-none text-moss">
              +
            </span>
          </summary>
          <p className="mt-3 max-w-3xl leading-relaxed text-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
