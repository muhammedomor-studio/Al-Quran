import type { CapacitorConfig } from "@capacitor/cli";
const config: CapacitorConfig = {
  appId: "com.ozeen.alquran".replace(/ /g, ""),
  appName: "সহজ কোরআন",
  webDir: "out",
  bundledWebRuntime: false,
  server: { androidScheme: "https" }
};
export default config;
