export type AppSettings = {
  theme: "light" | "dark" | "system";
  notifications: {
    water: boolean;
    mealReminder: boolean;
    weeklyReport: boolean;
  };
  units: "metric" | "imperial";
  privacy: "private" | "friends" | "public";
  connectedApis: {
    googleFit: boolean;
    appleHealth: boolean;
    usda: boolean;
  };
  dataExport: "csv" | "json";
};
