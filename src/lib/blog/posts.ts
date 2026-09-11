/** Contenido del blog, en español (mercado principal — ver docs/PLAN.md). No
 * hay versión en inglés todavía: es una simplificación deliberada, igual que
 * otras del proyecto (ver docs/RUNBOOK.md) — escribir y traducir contenido
 * real lleva tiempo, y el hispanohablante es el mercado desatendido que
 * define la tesis. Se sirve igual sin importar la cookie de idioma. */

export type BlogSection = {
  heading?: string;
  paragraphs?: string[];
  list?: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  /** ISO 8601, solo fecha. */
  publishedAt: string;
  intro: string;
  sections: BlogSection[];
  /** Link interno relacionado (ej: a /templates), para no dejar el artículo
   * como una isla sin salida a otras páginas del sitio. */
  relatedLink?: { href: string; label: string };
};

export const blogPosts: BlogPost[] = [
  {
    slug: "como-hacer-un-presupuesto-profesional",
    title: "Cómo hacer un presupuesto profesional que tu cliente apruebe rápido",
    description:
      "Qué tiene que tener un presupuesto para que se vea serio, evite idas y vueltas, y se acepte más rápido. Con estructura, ejemplos y errores comunes.",
    publishedAt: "2026-09-11",
    intro:
      "Un presupuesto mal armado no solo se ve poco profesional — genera preguntas, demora la aprobación, y a veces directamente hace que el cliente elija a otro que se lo mandó más claro. La buena noticia es que un presupuesto profesional no depende de diseño gráfico ni de plantillas caras: depende de que tenga la información correcta, en el orden correcto.",
    sections: [
      {
        heading: "1. Empezá con el contexto, no con la lista de precios",
        paragraphs: [
          "El primer párrafo de tu presupuesto no debería ser una tabla de números. Antes de eso, el cliente necesita leer un resumen breve de lo que entendiste que necesita y cómo se lo vas a resolver — dos o tres oraciones alcanzan. Esto hace dos cosas: confirma que escuchaste bien el pedido, y le da al cliente el contexto para leer el resto sin tener que adivinar por qué cada ítem cuesta lo que cuesta.",
        ],
      },
      {
        heading: "2. Separá el alcance de los entregables",
        paragraphs: [
          "El alcance es lo que vas a hacer (\"rediseño de la identidad visual\"); los entregables son lo que el cliente recibe al final (\"logo en SVG y PNG, manual de marca en PDF, 3 propuestas de paleta de color\"). Mezclarlos es la fuente más común de discusiones después: el cliente entendió que \"rediseño de identidad\" incluía el diseño de la tarjetas de presentación, vos entendiste que no. Sé específico en los entregables, y aclará también qué NO está incluido si hay algo que suele asumirse.",
        ],
      },
      {
        heading: "3. Un ítem por línea, con precio individual",
        paragraphs: [
          "Un solo número grande (\"Proyecto completo: $500.000\") es más difícil de aprobar que una lista desglosada, porque el cliente no puede evaluar si el precio es razonable ni negociar una parte puntual. Desglosar por ítem también te sirve a vos: si en el medio del proyecto el cliente pide sacar algo, ya tenés el precio de esa parte definido de antes, sin discutir de nuevo.",
        ],
      },
      {
        heading: "4. Los opcionales bien marcados generan más venta, no menos",
        paragraphs: [
          "Si tenés servicios adicionales que no todos los clientes van a querer (una segunda ronda de revisiones, hosting por un año, una sesión de fotos extra), marcalos como opcionales dentro del mismo presupuesto en vez de mencionarlos aparte por WhatsApp después. Un cliente que ya está mirando el presupuesto y ve un opcional bien descripto lo suma con mucha más facilidad que si tenés que volver a escribirle otro día para ofrecérselo.",
        ],
      },
      {
        heading: "5. Condiciones claras, antes de que hagan falta",
        paragraphs: [
          "Forma de pago (por adelantado, por hitos, contra entrega), plazo de entrega, y qué pasa si el cliente pide cambios fuera del alcance original. No hace falta que sea un contrato legal — dos o tres líneas claras evitan la mayoría de los malentendidos que después terminan en un cobro incómodo o un cliente enojado.",
        ],
      },
      {
        heading: "6. Poné una fecha de vencimiento",
        paragraphs: [
          "Un presupuesto sin fecha de vencimiento es un precio congelado para siempre, y eso te ata las manos si tus costos suben o si el proyecto cambia de alcance con el tiempo. Poné 15 o 30 días de validez — es estándar de la industria y le da al cliente una razón concreta para decidir pronto en vez de dejarlo \"para después\".",
        ],
      },
      {
        heading: "Lo que hace la diferencia: cómo lo mandás",
        paragraphs: [
          "Todo lo anterior importa poco si el presupuesto termina siendo un PDF perdido en un chat de WhatsApp que nadie vuelve a abrir. Mandarlo como un link — que se ve bien en el celular, y que te avisa apenas lo abrió — cambia la dinámica completa: dejás de preguntar \"¿lo viste?\" y empezás a saberlo. Podés armar el tuyo gratis con nuestras plantillas por rubro (diseño, fotografía, desarrollo, reformas y más) o desde cero.",
        ],
      },
    ],
    relatedLink: { href: "/templates", label: "Ver plantillas gratis por rubro" },
  },
  {
    slug: "que-tiene-que-incluir-una-plantilla-de-presupuesto",
    title: "Plantilla de presupuesto: qué tiene que incluir sí o sí",
    description:
      "Checklist de los campos que no pueden faltar en una plantilla de presupuesto, sea para diseño, desarrollo, fotografía o cualquier servicio freelance.",
    publishedAt: "2026-09-11",
    intro:
      "Armar una plantilla de presupuesto una sola vez y reusarla ahorra horas cada mes — el problema es cuando la plantilla está incompleta y cada presupuesto nuevo termina con parches distintos. Esta es la lista de campos que una plantilla completa necesita tener, sin importar el rubro.",
    sections: [
      {
        heading: "Datos del cliente y del proyecto",
        list: [
          "Nombre del cliente (o empresa, si corresponde)",
          "Título del proyecto o presupuesto — algo específico, no \"Presupuesto #1\"",
          "Fecha de emisión y fecha de vencimiento",
        ],
      },
      {
        heading: "El contenido del trabajo",
        list: [
          "Introducción breve: qué entendiste del pedido",
          "Alcance: qué vas a hacer",
          "Entregables: qué recibe el cliente al final, en qué formato",
          "Qué NO está incluido, si hay algo que suele asumirse",
        ],
      },
      {
        heading: "Los números",
        list: [
          "Ítems desglosados, uno por línea, con descripción y precio",
          "Ítems opcionales marcados como tales (no mezclados con los obligatorios)",
          "Total, calculado solo — nunca a mano, para evitar errores de suma",
          "Moneda explícita, sobre todo si trabajás con clientes de otros países",
        ],
      },
      {
        heading: "Condiciones",
        list: [
          "Forma de pago (adelanto, hitos, contra entrega)",
          "Plazo de entrega estimado",
          "Política sobre cambios fuera de alcance",
          "Link de pago, si cobrás por Mercado Pago, Stripe o similar",
        ],
      },
      {
        heading: "Lo que una plantilla en papel o Word no te puede dar",
        paragraphs: [
          "Una plantilla en Word o Excel resuelve la estructura, pero no te dice si el cliente la abrió, y no genera un registro de aceptación con fecha y hora cuando dice que sí. Si ya tenés la estructura clara, el siguiente paso natural es una plantilla que además haga ese seguimiento por vos — tenemos plantillas gratis ya armadas por rubro (diseño web, identidad de marca, fotografía de bodas, reformas, SEO, marketing digital) que podés usar como punto de partida y editar como quieras.",
        ],
      },
    ],
    relatedLink: { href: "/templates", label: "Ver plantillas gratis por rubro" },
  },
  {
    slug: "cuanto-tarda-un-cliente-en-aceptar-un-presupuesto",
    title: "Cuánto tarda un cliente en aceptar un presupuesto (y cómo acortar ese tiempo)",
    description:
      "Por qué los presupuestos se demoran más de lo esperado y qué cambiar en cómo los mandás para que el cliente decida más rápido.",
    publishedAt: "2026-09-11",
    intro:
      "\"Te lo mando y quedo atento\" es la parte más incómoda de trabajar como freelancer o estudio chico: una vez que el presupuesto salió, dejás de tener control sobre cuándo (o si) el cliente lo va a mirar. No hay una fórmula mágica para acelerar una decisión que no depende de vos, pero sí hay varias cosas concretas que alargan la espera sin necesidad — y se pueden arreglar.",
    sections: [
      {
        heading: "El problema no es la decisión, es la fricción antes de decidir",
        paragraphs: [
          "La mayoría de las demoras no son un cliente indeciso: son un presupuesto que quedó enterrado en un chat de WhatsApp entre otros veinte mensajes, o un PDF que hay que descargar y abrir con otra app antes de poder leerlo. Cada paso de fricción entre \"lo recibí\" y \"lo leí\" suma días, no minutos.",
        ],
      },
      {
        heading: "Mandalo como algo que se abre en un toque",
        paragraphs: [
          "Un link que abre directo en el navegador del celular, sin descargar nada, es la diferencia más grande que podés hacer. La mayoría de tus clientes van a abrir el presupuesto desde el teléfono, muchas veces en un momento libre entre otras cosas — si eso implica abrir un adjunto pesado o cambiar de app, es más fácil que lo dejen para después (y \"después\" en la práctica suele ser \"nunca\", hasta que vos volvés a escribir para preguntar).",
        ],
      },
      {
        heading: "Enterate cuándo lo vio, en vez de adivinar",
        paragraphs: [
          "Sin ningún tipo de seguimiento, no tenés forma de distinguir entre \"todavía no lo vio\" y \"lo vio y lo está pensando\" — y eso te deja sin saber si conviene escribir de nuevo o esperar. Si el presupuesto te avisa apenas se abrió por primera vez, podés esperar con información real en vez de mandar un \"¿lo viste?\" a ciegas a los tres días (que en el peor caso llega justo cuando el cliente recién lo estaba por leer).",
        ],
      },
      {
        heading: "Adjuntá lo que igual te van a pedir",
        paragraphs: [
          "\"¿Tenés fotos de trabajos anteriores?\" o \"¿me pasás un ejemplo de cómo queda?\" son preguntas que casi siempre llegan después de mandar el presupuesto — y cada una es otra ida y vuelta que suma días. Adjuntar esas referencias directo en el mismo presupuesto (fotos, un PDF de portfolio, una plantilla de ejemplo) adelanta esa pregunta antes de que el cliente la haga.",
        ],
      },
      {
        heading: "Una fecha de vencimiento visible es un empujón, no una presión",
        paragraphs: [
          "\"Válido hasta el 20 de septiembre\" en el propio presupuesto le da al cliente un motivo neutral y no incómodo para decidir en el corto plazo, en vez de dejarlo indefinidamente en la lista de pendientes. No hace falta ponerlo de forma agresiva — un dato visible y automático alcanza.",
        ],
      },
      {
        heading: "En resumen",
        paragraphs: [
          "Nada de esto reemplaza un buen precio o un buen trabajo previo, pero sacar la fricción innecesaria del medio — link en vez de PDF, aviso de apertura en vez de silencio, referencias adjuntas en vez de preguntas por chat — achica la parte de la demora que sí está bajo tu control. Podés probarlo gratis armando tu primer presupuesto con Presuly.",
        ],
      },
    ],
    relatedLink: { href: "/pricing", label: "Ver planes y precios" },
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

/** `new Date("2026-09-11")` se interpreta como UTC medianoche — en un huso
 * horario detrás de UTC (ej: Argentina) se muestra como el día anterior.
 * Parsear los componentes a mano lo arma en el huso horario local. */
export function parsePostDate(publishedAt: string): Date {
  const [year, month, day] = publishedAt.split("-").map(Number);
  return new Date(year, month - 1, day);
}
