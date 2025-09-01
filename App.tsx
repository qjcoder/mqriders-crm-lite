import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { runMigrations } from "./db";

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await runMigrations();
      console.log("DB ready ✅");
      setReady(true);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text>{ready ? "DB ready ✅" : "Setting up DB…"}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
