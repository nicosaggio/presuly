import Image from "next/image";

// El SVG tiene un viewBox de 175.115 x 41.953 (relación ~4.174:1) — mantener
// esa proporción evita que Next/Image lo estire.
const SIZES = {
  sm: { height: 22, width: 92 },
  md: { height: 28, width: 117 },
  lg: { height: 36, width: 150 },
} as const;

type Variant = "auto" | "verde" | "blanco" | "blanco-check-verde" | "tinta";

function pickSrc(base: "logo" | "isotipo", variant: Exclude<Variant, "auto">) {
  if (variant === "blanco-check-verde") return `/brand/presuly-${base}-blanco-check-verde.svg`;
  if (variant === "blanco") return `/brand/presuly-${base}-blanco.svg`;
  if (variant === "tinta") return `/brand/presuly-${base}-tinta.svg`;
  return `/brand/presuly-${base}.svg`;
}

/** Logotipo horizontal de Presuly. Ver docs/MARCA.md: no reescribir el nombre
 * con texto, siempre el SVG vectorizado.
 *
 * `variant="auto"` (default) muestra la versión verde en modo claro y, en
 * modo oscuro, la blanca con el check en el verde de modo oscuro (para que
 * no se pierda el color de marca en el ícono — pedido explícito de diseño,
 * 2026-09-07). Sigue el mismo `prefers-color-scheme` que el resto de los
 * tokens — ver `.presuly-logo-light`/`.presuly-logo-dark` en globals.css.
 * Pasá un variant fijo solo cuando el fondo no cambia con el tema (ej: sobre
 * una foto, o el logo a una tinta para PDF). */
export function Logo({
  size = "md",
  variant = "auto",
  className,
}: {
  size?: keyof typeof SIZES;
  variant?: Variant;
  className?: string;
}) {
  const { height, width } = SIZES[size];

  if (variant === "auto") {
    return (
      <>
        <Image
          src={pickSrc("logo", "verde")}
          alt="Presuly"
          height={height}
          width={width}
          priority
          className={`presuly-logo-light ${className ?? ""}`}
        />
        <Image
          src={pickSrc("logo", "blanco-check-verde")}
          alt="Presuly"
          height={height}
          width={width}
          priority
          className={`presuly-logo-dark ${className ?? ""}`}
        />
      </>
    );
  }

  return (
    <Image
      src={pickSrc("logo", variant)}
      alt="Presuly"
      height={height}
      width={width}
      priority
      className={className}
    />
  );
}

/** Solo el símbolo (la P con el check), sin el nombre. Para la firma al pie del
 * presupuesto y como avatar — ver docs/MARCA.md. Mismo `variant="auto"` que
 * `Logo`. */
export function LogoMark({
  size = 18,
  variant = "auto",
  className,
}: {
  size?: number;
  variant?: Variant;
  className?: string;
}) {
  if (variant === "auto") {
    return (
      <>
        <Image
          src={pickSrc("isotipo", "verde")}
          alt=""
          height={size}
          width={size}
          className={`presuly-logo-light ${className ?? ""}`}
        />
        <Image
          src={pickSrc("isotipo", "blanco-check-verde")}
          alt=""
          height={size}
          width={size}
          className={`presuly-logo-dark ${className ?? ""}`}
        />
      </>
    );
  }

  return (
    <Image
      src={pickSrc("isotipo", variant)}
      alt=""
      height={size}
      width={size}
      className={className}
    />
  );
}
