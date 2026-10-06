/** Ícono del mapa (globo terráqueo a color); sustituye al globo monocromo de lucide. */
export function MapIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src="/icon-mapa.png"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      draggable={false}
      className={`inline-block shrink-0 select-none object-contain ${className}`}
    />
  );
}
