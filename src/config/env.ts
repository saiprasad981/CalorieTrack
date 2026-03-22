export const env = {
  mongoUri: process.env.MONGODB_URI,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  authSecret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  nextAuthUrl: process.env.NEXTAUTH_URL,
  usdaApiKey: process.env.USDA_API_KEY,
  jwtSecret: process.env.JWT_SECRET,
  geminiApiKey: process.env.GEMINI_API_KEY,
};

export const isMongoConfigured = Boolean(env.mongoUri);
export const isGoogleAuthConfigured = Boolean(
  env.googleClientId && env.googleClientSecret && env.authSecret,
);
export const isUsdaConfigured = Boolean(env.usdaApiKey);
export const isGeminiConfigured = Boolean(env.geminiApiKey);
