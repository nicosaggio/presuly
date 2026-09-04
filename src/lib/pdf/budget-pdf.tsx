import {
  Document,
  Page,
  Text,
  View,
  Link,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { Budget, BudgetItem, Acceptance } from "@/lib/db/schema";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Locale } from "@/lib/i18n";

const styles = StyleSheet.create({
  page: { padding: 44, fontSize: 11, fontFamily: "Helvetica", color: "#18181b" },
  title: { fontSize: 20, marginBottom: 4, fontFamily: "Helvetica-Bold" },
  subtitle: { fontSize: 11, color: "#52525b", marginBottom: 24 },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 12,
    marginBottom: 6,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: "#52525b",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
  },
  itemDesc: { flex: 1, paddingRight: 12 },
  itemPrice: { width: 90, textAlign: "right" },
  total: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#18181b",
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 44,
    right: 44,
    fontSize: 9,
    color: "#a1a1aa",
    textAlign: "center",
  },
  sealBox: {
    marginTop: 24,
    padding: 14,
    backgroundColor: "#f4f4f5",
    borderRadius: 4,
  },
  sealTitle: { fontFamily: "Helvetica-Bold", marginBottom: 2 },
  sealNote: { marginTop: 6, fontSize: 8, color: "#71717a" },
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
                style={{ color: "#18181b", marginBottom: 4 }}
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
            {isEn
              ? "Made with Presuly — create your free proposal at presuly.com.ar"
              : "Hecho con Presuly — creá tu presupuesto gratis en presuly.com.ar"}
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
