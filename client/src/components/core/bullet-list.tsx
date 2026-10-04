export function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="grid gap-1.5">
      {items.map((item, index) => (
        <li key={index} className="flex gap-2 text-sm text-muted-foreground">
          <span aria-hidden className="text-subtle">
            —
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}
