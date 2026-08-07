export default function Spinner({ size = 24 }: { size?: number }) {
  return (
    <div
      className="inline-block animate-spin rounded-full border-2 border-current border-t-transparent text-pine-600"
      style={{ width: size, height: size }}
      role="status"
      aria-label="جارِ التحميل"
    />
  );
}
