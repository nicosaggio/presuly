type Localized = { es: string; en: string };

export type TemplateItem = {
  description: Localized;
  price: number;
  optional: boolean;
};

export type BudgetTemplate = {
  slug: string;
  industryLabel: Localized;
  title: Localized;
  intro: Localized;
  scope: Localized;
  conditions: Localized;
  currency: string;
  items: TemplateItem[];
};

export const templates: BudgetTemplate[] = [
  {
    slug: "diseno-desarrollo-web",
    industryLabel: { es: "Diseño y desarrollo web", en: "Web design & development" },
    title: { es: "Diseño y desarrollo de sitio web", en: "Website design & development" },
    intro: {
      es: "Gracias por la confianza. Este presupuesto cubre el diseño y desarrollo de tu sitio web, desde la primera reunión hasta la publicación.",
      en: "Thanks for your trust. This proposal covers the design and development of your website, from kickoff to launch.",
    },
    scope: {
      es: "Diseño de hasta 5 secciones (inicio, nosotros, servicios, contacto y una a definir), responsive para celular y escritorio, optimización básica de velocidad y SEO técnico, formulario de contacto funcional.",
      en: "Design of up to 5 sections (home, about, services, contact, and one more to define), responsive for mobile and desktop, basic speed and technical SEO optimization, working contact form.",
    },
    conditions: {
      es: "50% para empezar, 50% contra entrega. Incluye 2 rondas de ajustes de diseño. Hosting y dominio no incluidos.",
      en: "50% upfront, 50% on delivery. Includes 2 rounds of design revisions. Hosting and domain not included.",
    },
    currency: "USD",
    items: [
      { description: { es: "Diseño UI (hasta 5 secciones)", en: "UI design (up to 5 sections)" }, price: 600, optional: false },
      { description: { es: "Desarrollo y publicación", en: "Development & launch" }, price: 900, optional: false },
      { description: { es: "Mantenimiento mensual (3 meses)", en: "Monthly maintenance (3 months)" }, price: 150, optional: false },
    ],
  },
  {
    slug: "identidad-de-marca",
    industryLabel: { es: "Branding", en: "Branding" },
    title: { es: "Identidad de marca", en: "Brand identity" },
    intro: {
      es: "Una propuesta para construir una identidad visual clara y consistente para tu marca.",
      en: "A proposal to build a clear, consistent visual identity for your brand.",
    },
    scope: {
      es: "Investigación y moodboard, logotipo (3 propuestas iniciales), paleta de colores y tipografías, manual de marca básico en PDF.",
      en: "Research and moodboard, logo (3 initial concepts), color palette and typography, basic brand manual in PDF.",
    },
    conditions: {
      es: "50% para empezar, 50% contra entrega del manual final. Incluye 2 rondas de ajustes sobre la propuesta elegida.",
      en: "50% upfront, 50% on delivery of the final manual. Includes 2 rounds of revisions on the chosen concept.",
    },
    currency: "USD",
    items: [
      { description: { es: "Investigación y moodboard", en: "Research & moodboard" }, price: 150, optional: false },
      { description: { es: "Diseño de logotipo", en: "Logo design" }, price: 400, optional: false },
      { description: { es: "Manual de marca", en: "Brand manual" }, price: 250, optional: false },
      { description: { es: "Aplicaciones (papelería, redes)", en: "Applications (stationery, social media)" }, price: 200, optional: false },
    ],
  },
  {
    slug: "fotografia-de-bodas",
    industryLabel: { es: "Fotografía de bodas", en: "Wedding photography" },
    title: { es: "Cobertura fotográfica de casamiento", en: "Wedding photography coverage" },
    intro: {
      es: "Gracias por pensar en mí para acompañar uno de los días más importantes de tu vida.",
      en: "Thank you for considering me to capture one of the most important days of your life.",
    },
    scope: {
      es: "Cobertura de 8 horas el día del evento, preparativos y ceremonia incluidos, entrega de al menos 400 fotos editadas en alta resolución, galería online privada para compartir con invitados.",
      en: "8-hour coverage on the wedding day, including preparations and ceremony, delivery of at least 400 edited high-resolution photos, private online gallery to share with guests.",
    },
    conditions: {
      es: "Seña del 30% para reservar la fecha, saldo una semana antes del evento. Entrega de fotos editadas dentro de los 30 días.",
      en: "30% deposit to reserve the date, balance due one week before the event. Edited photos delivered within 30 days.",
    },
    currency: "USD",
    items: [
      { description: { es: "Cobertura del día (8 horas)", en: "Wedding day coverage (8 hours)" }, price: 900, optional: false },
      { description: { es: "Edición y entrega digital", en: "Editing & digital delivery" }, price: 300, optional: false },
      { description: { es: "Álbum impreso (30x30cm)", en: "Printed album (30x30cm)" }, price: 250, optional: false },
      { description: { es: "Segundo fotógrafo", en: "Second photographer" }, price: 300, optional: false },
    ],
  },
  {
    slug: "reforma-de-cocina",
    industryLabel: { es: "Reformas", en: "Renovations" },
    title: { es: "Reforma integral de cocina", en: "Full kitchen renovation" },
    intro: {
      es: "Presupuesto para la reforma completa de tu cocina, de demolición a terminación.",
      en: "Proposal for a complete kitchen renovation, from demolition to finishing.",
    },
    scope: {
      es: "Demolición de instalación existente, instalación eléctrica y de gas, colocación de muebles bajo y alto medida estándar, mesada, colocación de bacha y grifería, pintura.",
      en: "Demolition of existing setup, electrical and gas work, standard-size upper and lower cabinets, countertop, sink and faucet installation, painting.",
    },
    conditions: {
      es: "40% para empezar, 30% a mitad de obra, 30% contra finalización. Plazo estimado: 3 semanas. No incluye electrodomésticos.",
      en: "40% upfront, 30% mid-project, 30% on completion. Estimated timeline: 3 weeks. Appliances not included.",
    },
    currency: "USD",
    items: [
      { description: { es: "Demolición e instalaciones", en: "Demolition & utilities" }, price: 800, optional: false },
      { description: { es: "Muebles y mesada", en: "Cabinets & countertop" }, price: 2200, optional: false },
      { description: { es: "Pintura y terminaciones", en: "Painting & finishing" }, price: 400, optional: false },
      { description: { es: "Iluminación LED bajo alacena", en: "Under-cabinet LED lighting" }, price: 180, optional: false },
    ],
  },
  {
    slug: "consultoria-seo",
    industryLabel: { es: "Consultoría SEO", en: "SEO consulting" },
    title: { es: "Consultoría SEO mensual", en: "Monthly SEO consulting" },
    intro: {
      es: "Un plan mensual para mejorar el posicionamiento orgánico de tu sitio de forma sostenida.",
      en: "A monthly plan to steadily improve your site's organic search ranking.",
    },
    scope: {
      es: "Auditoría técnica inicial, investigación de palabras clave, optimización on-page de hasta 10 páginas, informe mensual de resultados, 2 artículos de blog optimizados por mes.",
      en: "Initial technical audit, keyword research, on-page optimization of up to 10 pages, monthly results report, 2 optimized blog posts per month.",
    },
    conditions: {
      es: "Facturación mensual por adelantado. Compromiso mínimo de 3 meses (el SEO no da resultados de un día para el otro).",
      en: "Monthly billing in advance. Minimum 3-month commitment (SEO doesn't show results overnight).",
    },
    currency: "USD",
    items: [
      { description: { es: "Auditoría técnica inicial", en: "Initial technical audit" }, price: 300, optional: false },
      { description: { es: "Gestión mensual SEO", en: "Monthly SEO management" }, price: 450, optional: false },
      { description: { es: "Artículos de blog adicionales (c/u)", en: "Extra blog posts (each)" }, price: 60, optional: false },
    ],
  },
  {
    slug: "marketing-digital-mensual",
    industryLabel: { es: "Marketing digital", en: "Digital marketing" },
    title: { es: "Gestión de redes sociales y pauta", en: "Social media & ads management" },
    intro: {
      es: "Un plan mensual para hacer crecer tu presencia en redes y generar más consultas calificadas.",
      en: "A monthly plan to grow your social presence and generate more qualified leads.",
    },
    scope: {
      es: "Calendario de contenido, diseño y publicación de 12 piezas por mes, gestión de campañas de pauta (presupuesto de pauta a cargo del cliente), informe mensual de resultados.",
      en: "Content calendar, design and posting of 12 pieces per month, ad campaign management (ad spend covered by the client), monthly results report.",
    },
    conditions: {
      es: "Facturación mensual por adelantado. Compromiso mínimo de 2 meses. El presupuesto de pauta publicitaria se paga aparte, directo a la plataforma.",
      en: "Monthly billing in advance. Minimum 2-month commitment. Ad spend is paid separately, directly to the platform.",
    },
    currency: "USD",
    items: [
      { description: { es: "Contenido y publicación (12 piezas/mes)", en: "Content & posting (12 pieces/mo)" }, price: 350, optional: false },
      { description: { es: "Gestión de campañas de pauta", en: "Ad campaign management" }, price: 250, optional: false },
      { description: { es: "Piezas de video adicionales", en: "Extra video pieces" }, price: 80, optional: false },
    ],
  },
];

export function getTemplateBySlug(slug: string) {
  return templates.find((t) => t.slug === slug) ?? null;
}
