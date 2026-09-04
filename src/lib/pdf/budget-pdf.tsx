import { join } from "node:path";
import { readFileSync } from "node:fs";
import {
  Document,
  Page,
  Text,
  View,
  Link,
  Image,
  Svg,
  Path,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { Budget, BudgetItem, Acceptance } from "@/lib/db/schema";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Locale } from "@/lib/i18n";

// Paleta de marca — ver docs/MARCA.md. El PDF usa la versión a una tinta del
// logotipo (impresión), no el verde.
const TINTA = "#101917";
const TEXTO_2 = "#5B6A67";
const TEXTO_3 = "#8A9794";
const BORDE = "#E3E9E7";
const VERDE_CLARO = "#E3F0ED";
const VERDE = "#0C6E63";

// react-pdf's <Image> intenta hacer fetch() de cualquier src que sea un string
// (incluso un path local), así que hay que pasarle el buffer ya leído.
const LOGO_BUFFER = readFileSync(
  join(process.cwd(), "public/brand/presuly-logo-tinta-1200.png")
);

const styles = StyleSheet.create({
  page: { padding: 44, fontSize: 11, fontFamily: "Helvetica", color: TINTA },
  logo: { height: 20, width: 83.5, marginBottom: 20 },
  title: { fontSize: 20, marginBottom: 4, fontFamily: "Helvetica-Bold" },
  subtitle: { fontSize: 11, color: TEXTO_2, marginBottom: 24 },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 12,
    marginBottom: 6,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: TEXTO_2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: BORDE,
  },
  itemDesc: { flex: 1, paddingRight: 12 },
  itemPrice: { width: 90, textAlign: "right" },
  total: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: TINTA,
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 44,
    right: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  footerText: { fontSize: 9, color: TEXTO_3 },
  sealBox: {
    marginTop: 24,
    padding: 14,
    backgroundColor: VERDE_CLARO,
    borderRadius: 8,
  },
  sealTitle: { fontFamily: "Helvetica-Bold", marginBottom: 2, color: VERDE },
  sealNote: { marginTop: 6, fontSize: 8, color: TEXTO_2 },
});

function billableTotal(items: BudgetItem[]) {
  return items
    .filter((item) => !item.optional || item.selected)
    .reduce((sum, item) => sum + item.price, 0);
}

export function BudgetPdfDocument({
  budget,
  acceptance,
  locale,
  showBranding = true,
}: {
  budget: Budget;
  acceptance?: Acceptance | null;
  locale: Locale;
  showBranding?: boolean;
}) {
  const total = billableTotal(budget.items);
  const isEn = locale === "en";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- Image acá es de @react-pdf/renderer, no <img> de HTML */}
        <Image src={LOGO_BUFFER} style={styles.logo} />
        <Text style={styles.title}>{budget.title}</Text>
        <Text style={styles.subtitle}>
          {isEn ? "Prepared for" : "Preparado para"} {budget.clientName}
        </Text>

        {budget.intro ? (
          <View style={styles.section}>
            <Text>{budget.intro}</Text>
          </View>
        ) : null}

        {budget.scope ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isEn ? "Scope and deliverables" : "Alcance y entregables"}
            </Text>
            <Text>{budget.scope}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isEn ? "Details" : "Detalle"}
          </Text>
          {budget.items.map((item) => (
            <View style={styles.row} key={item.id}>
              <Text style={styles.itemDesc}>
                {item.description}
                {item.optional
                  ? `  (${isEn ? "optional" : "opcional"}${
                      item.selected ? "" : isEn ? ", not selected" : ", no seleccionado"
                    })`
                  : ""}
              </Text>
              <Text style={styles.itemPrice}>
                {formatCurrency(item.price, budget.currency, locale)}
              </Text>
            </View>
          ))}
          <View style={styles.total}>
            <Text>{isEn ? "Total" : "Total"}</Text>
            <Text>{formatCurrency(total, budget.currency, locale)}</Text>
          </View>
        </View>

        {budget.attachments.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isEn ? "Attachments" : "Adjuntos"}
            </Text>
            {budget.attachments.map((a) => (
              <Link
                key={a.id}
                src={`${process.env.APP_URL ?? "https://presuly.com.ar"}/api/attachments/${a.key}?name=${encodeURIComponent(a.name)}`}
                style={{ color: TINTA, marginBottom: 4 }}
              >
                {a.name}
              </Link>
            ))}
          </View>
        ) : null}

        {budget.conditions ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isEn ? "Conditions" : "Condiciones"}
            </Text>
            <Text>{budget.conditions}</Text>
          </View>
        ) : null}

        {acceptance ? (
          <View style={styles.sealBox}>
            <Text style={styles.sealTitle}>
              {isEn ? "Accepted by" : "Aceptado por"} {acceptance.signerName}
            </Text>
            <Text>{formatDateTime(acceptance.createdAt, locale)}</Text>
            <Text style={styles.sealNote}>
              {isEn
                ? "This is a timestamped acceptance record, not a certified digital signature."
                : "Este es un registro de aceptación con sello de tiempo, no una firma digital certificada."}
            </Text>
          </View>
        ) : null}

        {showBranding && (
          <Link
            src="https://presuly.com.ar?utm_source=pdf_footer"
            style={styles.footer}
            fixed
          >
            <Svg viewBox="12.5 12 40 41" width={11} height={11}>
              <Path
                fillRule="evenodd"
                d="M12.5 51 V12 H29.5 A11 11 0 0 1 29.5 34 H21.5 V51 Z M21.5 19 H28.5 A4 4 0 0 1 28.5 27 H21.5 Z"
                fill={TEXTO_3}
              />
              <Path
                d="M29.5 43 L35.5 49 L48.5 32"
                fill="none"
                stroke={TEXTO_3}
                strokeWidth={8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={styles.footerText}>
              {isEn
                ? "Made with Presuly — create your free proposal at presuly.com.ar"
                : "Hecho con Presuly — creá tu presupuesto gratis en presuly.com.ar"}
            </Text>
          </Link>
        )}
      </Page>
    </Document>
  );
}

export async function renderBudgetPdf(
  budget: Budget,
  acceptance: Acceptance | null,
  locale: Locale,
  showBranding = true
): Promise<Buffer> {
  return renderToBuffer(
    <BudgetPdfDocument
      budget={budget}
      acceptance={acceptance}
      locale={locale}
      showBranding={showBranding}
    />
  );
}
