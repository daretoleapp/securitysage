const isServer = typeof window === "undefined";

export const env = {
  openrouterKey: () => (isServer ? process.env.OPENROUTER_API_KEY : undefined) || "",
  mimoModelPro: () => (isServer ? process.env.MIMO_MODEL_PRO : undefined) || "xiaomi/mimo-v2.5-pro",
  mimoModelVL: () => (isServer ? process.env.MIMO_MODEL_VL : undefined) || "xiaomi/mimo-v2.5",
  mimoMaxTokens: () => parseInt((isServer ? process.env.MIMO_MAX_TOKENS_PRO : undefined) || "180", 10),
  mimoMaxTokensVL: () => parseInt((isServer ? process.env.MIMO_MAX_TOKENS_VL : undefined) || "180", 10),
  isMimoAvailable: () => Boolean(isServer && process.env.OPENROUTER_API_KEY),
};
