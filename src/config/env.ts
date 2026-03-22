function cleanEnv(value: string | undefined) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return undefined;
  }

  const normalized = trimmed.toLowerCase();
  const placeholderPrefixes = [
    "your-",
    "your_",
    "replace-",
    "replace_",
    "example",
    "changeme",
    "change-me",
    "<",
  ];

  if (placeholderPrefixes.some((prefix) => normalized.startsWith(prefix))) {
    return undefined;
  }

  return trimmed;
}

export const env = {
  mongoUri: cleanEnv(process.env.MONGODB_URI),
  googleClientId: cleanEnv(process.env.GOOGLE_CLIENT_ID),
  googleClientSecret: cleanEnv(process.env.GOOGLE_CLIENT_SECRET),
  authSecret: cleanEnv(process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET),
  nextAuthUrl: cleanEnv(process.env.NEXTAUTH_URL),
  usdaApiKey: cleanEnv(process.env.USDA_API_KEY),
  jwtSecret: cleanEnv(process.env.JWT_SECRET),
  huggingFaceApiKey: cleanEnv(process.env.HUGGINGFACE_API_KEY),
  huggingFaceModel: cleanEnv(process.env.HUGGINGFACE_MODEL),
};

export const isMongoConfigured = Boolean(env.mongoUri);
export const isGoogleAuthConfigured = Boolean(
  env.googleClientId && env.googleClientSecret && env.authSecret,
);
export const isUsdaConfigured = Boolean(env.usdaApiKey);
export const isHuggingFaceConfigured = Boolean(env.huggingFaceApiKey);
