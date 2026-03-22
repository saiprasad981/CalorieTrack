function cleanEnv(value: string | undefined) {
  return value?.trim();
}

export const env = {
  mongoUri: cleanEnv(process.env.MONGODB_URI),
  googleClientId: cleanEnv(process.env.GOOGLE_CLIENT_ID),
  googleClientSecret: cleanEnv(process.env.GOOGLE_CLIENT_SECRET),
  authSecret: cleanEnv(process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET),
  nextAuthUrl: cleanEnv(process.env.NEXTAUTH_URL),
  usdaApiKey: cleanEnv(process.env.USDA_API_KEY),
  jwtSecret: cleanEnv(process.env.JWT_SECRET),
  geminiApiKey: cleanEnv(process.env.GEMINI_API_KEY),
};

export const isMongoConfigured = Boolean(env.mongoUri);
export const isGoogleAuthConfigured = Boolean(
  env.googleClientId && env.googleClientSecret && env.authSecret,
);
export const isUsdaConfigured = Boolean(env.usdaApiKey);
export const isGeminiConfigured = Boolean(env.geminiApiKey);
