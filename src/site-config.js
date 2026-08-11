export const DEFAULT_SITE_CONFIG = {
  brand: {
    name: "Print It Now",
    headline: "ประเมินราคาชิ้นงาน",
    subcopy: "อัปโหลด STL หรือ OBJ แล้วดูขนาด น้ำหนัก เวลา และราคาทันที"
  },
  admin: {
    username: "bunnamchai",
    password: "7321"
  },
  integrations: {
    formspreeEndpoint: "https://formspree.io/f/mwleokgd",
    tallyFormUrl: ""
  },
  pricing: {
    setupFeeThb: 35,
    minimumChargeThb: 120,
    roundToThb: 5,
    wasteMultiplier: 1.12,
    supportPercent: 5,
    markupMultiplier: 1.22,
    timeRateThbPerHour: 65,
    volumeRateThbPerCm3: 0,
    surfaceRateThbPerCm2: 0,
    infillRateThbPerPercent: 0,
    baseShellFraction: 0.24,
    infillInfluence: 0.72,
    layerHeightMm: 0.2,
    secondsPerLayer: 6
  },
  printOptions: {
    layerHeightOptionsMm: [0.16, 0.2, 0.24]
  },
  materials: {
    pla: {
      key: "pla",
      name: "PLA",
      enabled: true,
      densityGPerCm3: 1.24,
      pricePerGramThb: 3,
      volumetricFlowMm3PerSecond: 8
    },
    petg: {
      key: "petg",
      name: "PETG",
      enabled: true,
      densityGPerCm3: 1.27,
      pricePerGramThb: 3.8,
      volumetricFlowMm3PerSecond: 6.5
    },
    abs: {
      key: "abs",
      name: "ABS",
      enabled: true,
      densityGPerCm3: 1.04,
      pricePerGramThb: 4.2,
      volumetricFlowMm3PerSecond: 6
    }
  },
  colors: [
    { id: "white", name: "White", hex: "#f4f7fb", enabled: true },
    { id: "black", name: "Black", hex: "#11151a", enabled: true },
    { id: "red", name: "Red", hex: "#cf3a43", enabled: true },
    { id: "blue", name: "Blue", hex: "#3d74e7", enabled: true }
  ]
};
