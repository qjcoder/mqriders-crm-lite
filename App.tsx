import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import { runMigrations } from "./db";
import { getDashboard } from "./services/finance";

type Dash = {
  stockQty: number;
  soldRevenue: number;
  profit: number;
  receivables: number; // customers owe you
  payables: number; // you owe vendors
};

export default function App() {
  const [ready, setReady] = useState(false);
  const [dash, setDash] = useState<Dash | null>(null);

  useEffect(() => {
    (async () => {
      await runMigrations();
      setReady(true);
      const d = await getDashboard();
      setDash(d);
    })();
  }, []);

  if (!ready || !dash) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>MQ Riders CRM Lite — Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Stock in Hand</Text>
        <Text style={styles.value}>{dash.stockQty}</Text>
      </View>

      <View style={styles.cardRow}>
        <View style={[styles.card, styles.cardHalf]}>
          <Text style={styles.label}>Revenue (Sold)</Text>
          <Text style={styles.value}>₨ {dash.soldRevenue.toFixed(0)}</Text>
        </View>
        <View style={[styles.card, styles.cardHalf]}>
          <Text style={styles.label}>Profit</Text>
          <Text style={styles.value}>₨ {dash.profit.toFixed(0)}</Text>
        </View>
      </View>

      <View style={styles.cardRow}>
        <View style={[styles.card, styles.cardHalf]}>
          <Text style={styles.label}>Receivables (Customers)</Text>
          <Text style={styles.value}>₨ {dash.receivables.toFixed(0)}</Text>
        </View>
        <View style={[styles.card, styles.cardHalf]}>
          <Text style={styles.label}>Payables (Vendors)</Text>
          <Text style={styles.value}>₨ {dash.payables.toFixed(0)}</Text>
        </View>
      </View>

      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { padding: 16, gap: 12 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardRow: { flexDirection: "row", gap: 12 },
  cardHalf: { flex: 1 },
  label: { fontSize: 12, color: "#666" },
  value: { fontSize: 20, fontWeight: "700", marginTop: 6 },
});
