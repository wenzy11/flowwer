import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type { QuoteWithDetails } from "@/lib/db/quotes";
import type { CompanySettings } from "@/lib/db/types";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#171717",
  },
  header: {
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: "#00a67e",
    paddingBottom: 12,
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00a67e",
  },
  subtitle: {
    marginTop: 4,
    color: "#525252",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#00a67e",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f4f4f5",
    padding: 8,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
  },
  colDesc: { width: "40%" },
  colUnit: { width: "12%", textAlign: "center" },
  colQty: { width: "12%", textAlign: "right" },
  colCost: { width: "18%", textAlign: "right" },
  colTotal: { width: "18%", textAlign: "right" },
  totalsBox: {
    marginTop: 16,
    alignSelf: "flex-end",
    width: 220,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: "#1e3a5f",
    fontWeight: "bold",
    fontSize: 12,
  },
  notes: {
    marginTop: 24,
    padding: 12,
    backgroundColor: "#fafafa",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#a1a1aa",
    fontSize: 8,
  },
});

type QuotePdfProps = {
  quote: QuoteWithDetails;
  company: CompanySettings;
  labels: {
    quote: string;
    billTo: string;
    description: string;
    unit: string;
    qty: string;
    unitPrice: string;
    total: string;
    subtotal: string;
    markup: string;
    tax: string;
    grandTotal: string;
    deposit: string;
    personalMessage: string;
    notes: string;
    validUntil: string;
  };
  formatCurrency: (value: number) => string;
};

export function QuotePdfDocument({
  quote,
  company,
  labels,
  formatCurrency,
}: QuotePdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.companyName}>{company.companyName}</Text>
          {company.email ? (
            <Text style={styles.subtitle}>{company.email}</Text>
          ) : null}
          {company.phone ? (
            <Text style={styles.subtitle}>{company.phone}</Text>
          ) : null}
          {company.address ? (
            <Text style={styles.subtitle}>{company.address}</Text>
          ) : null}
        </View>

        <View style={styles.row}>
          <View>
            <Text style={styles.sectionTitle}>{labels.quote}</Text>
            <Text>{quote.quoteNumber}</Text>
            <Text style={styles.subtitle}>
              {new Date(quote.createdAt).toLocaleDateString()}
            </Text>
            {quote.validUntil ? (
              <Text style={styles.subtitle}>
                {labels.validUntil}: {quote.validUntil}
              </Text>
            ) : null}
          </View>
          <View>
            <Text style={styles.sectionTitle}>{labels.billTo}</Text>
            <Text>{quote.clientName}</Text>
            {quote.clientEmail ? (
              <Text style={styles.subtitle}>{quote.clientEmail}</Text>
            ) : null}
            {quote.clientPhone ? (
              <Text style={styles.subtitle}>{quote.clientPhone}</Text>
            ) : null}
            {quote.clientAddress ? (
              <Text style={styles.subtitle}>{quote.clientAddress}</Text>
            ) : null}
          </View>
        </View>

        <View>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>{labels.description}</Text>
            <Text style={styles.colUnit}>{labels.unit}</Text>
            <Text style={styles.colQty}>{labels.qty}</Text>
            <Text style={styles.colCost}>{labels.unitPrice}</Text>
            <Text style={styles.colTotal}>{labels.total}</Text>
          </View>
          {quote.lineItems.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.colDesc}>{item.name}</Text>
              <Text style={styles.colUnit}>{item.unit}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colCost}>
                {formatCurrency(item.unitCost)}
              </Text>
              <Text style={styles.colTotal}>
                {formatCurrency(item.lineTotal)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text>{labels.subtotal}</Text>
            <Text>{formatCurrency(quote.subtotal)}</Text>
          </View>
          {quote.markupPercent > 0 ? (
            <View style={styles.totalRow}>
              <Text>
                {labels.markup} ({quote.markupPercent}%)
              </Text>
              <Text>{formatCurrency(quote.markupAmount)}</Text>
            </View>
          ) : null}
          {quote.taxPercent > 0 ? (
            <View style={styles.totalRow}>
              <Text>
                {labels.tax} ({quote.taxPercent}%)
              </Text>
              <Text>{formatCurrency(quote.taxAmount)}</Text>
            </View>
          ) : null}
          {quote.depositPercent > 0 ? (
            <View style={styles.totalRow}>
              <Text>
                {labels.deposit} ({quote.depositPercent}%)
              </Text>
              <Text>{formatCurrency(quote.depositAmount)}</Text>
            </View>
          ) : null}
          <View style={styles.grandTotal}>
            <Text>{labels.grandTotal}</Text>
            <Text>{formatCurrency(quote.total)}</Text>
          </View>
        </View>

        {quote.personalMessage ? (
          <View style={styles.notes}>
            <Text style={styles.sectionTitle}>{labels.personalMessage}</Text>
            <Text>{quote.personalMessage}</Text>
          </View>
        ) : null}

        {quote.notes ? (
          <View style={styles.notes}>
            <Text style={styles.sectionTitle}>{labels.notes}</Text>
            <Text>{quote.notes}</Text>
          </View>
        ) : null}

        {(company.licenseNumber || company.insuranceInfo) && (
          <View style={{ marginTop: 12 }}>
            {company.licenseNumber ? (
              <Text style={styles.subtitle}>
                License: {company.licenseNumber}
              </Text>
            ) : null}
            {company.insuranceInfo ? (
              <Text style={styles.subtitle}>{company.insuranceInfo}</Text>
            ) : null}
          </View>
        )}
        <Text style={styles.footer}>{company.companyName}</Text>
      </Page>
    </Document>
  );
}
