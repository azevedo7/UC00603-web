export default function Loading() {
  return (
    <div role="status" className="space-y-5">
      <p className="text-sm text-muted">A carregar os registos…</p>
      <div className="h-28 animate-pulse rounded-xl bg-mint" />
      <div className="h-72 animate-pulse rounded-xl bg-white" />
    </div>
  );
}
