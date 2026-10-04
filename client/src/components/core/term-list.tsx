export function TermList({ terms }: { terms: string[] }) {
  if (terms.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-1.5">
      {terms.map((term) => (
        <li
          key={term}
          className="rounded-md bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground"
        >
          {term}
        </li>
      ))}
    </ul>
  );
}
