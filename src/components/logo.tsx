import Image from "next/image";

// El SVG tiene un viewBox de 175.115 x 41.953 (relación ~4.174:1) — mantener
// esa proporción evita que Next/Image lo estire.
const SIZES = {
  sm: { height: 22, width: 92 },
  md: { height: 28, width: 117 },
  lg: { height: 36, width: 150 },
} as const;

/** Logotipo horizontal de Presuly. Ver docs/MARCA.md: no reescribir el nombre
 * con texto, siempre el SVG vectorizado. */
export function Logo({
  size = "md",
  variant = "verde",
  className,
}: {
  size?: keyof typeof SIZES;
  variant?: "verde" | "blanco" | "tinta";
  className?: string;
}) {
  const { height, width } = SIZES[size];
  const src =
    variant === "blanco"
      ? "/brand/presuly-logo-blanco.svg"
      : variant === "tinta"
        ? "/brand/presuly-logo-tinta.svg"
        : "/brand/presuly-logo.svg";

  return (
    <Image
      src={src}
      alt="Presuly"
      height={height}
      width={width}
      priority
      className={className}
    />
  );
}

/** Solo el símbolo (la P con el check), sin el nombre. Para la firma al pie del
 * presupuesto y como avatar — ver docs/MARCA.md. */
export function LogoMark({
  size = 18,
  variant = "verde",
  className,
}: {
  size?: number;
  variant?: "verde" | "blanco" | "tinta";
  className?: string;
}) {
  const src =
    variant === "blanco"
      ? "/brand/presuly-isotipo-blanco.svg"
      : variant === "tinta"
        ? "/brand/presuly-isotipo-tinta.svg"
        : "/brand/presuly-isotipo.svg";

  return (
    <Image src={src} alt="" height={size} width={size} className={className} />
  );
}
