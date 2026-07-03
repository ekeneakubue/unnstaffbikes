const requiredVars = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
] as const;

export type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string | null;
};

export function getR2Config(): R2Config {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL ?? null;

  for (const key of requiredVars) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  return {
    accountId: accountId!,
    accessKeyId: accessKeyId!,
    secretAccessKey: secretAccessKey!,
    bucketName: bucketName!,
    publicUrl,
  };
}

export function buildPublicUrl(key: string) {
  const { publicUrl, bucketName, accountId } = getR2Config();

  if (publicUrl) {
    return `${publicUrl.replace(/\/$/, "")}/${key}`;
  }

  return `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${key}`;
}

export function isR2Configured() {
  const hasS3 = requiredVars.every((key) => Boolean(process.env[key]));
  const hasCloudflareApi = Boolean(
    process.env.CLOUDFLARE_API_TOKEN?.trim() &&
      process.env.R2_ACCOUNT_ID &&
      process.env.R2_BUCKET_NAME,
  );

  return hasS3 || hasCloudflareApi;
}

export function validateR2Credentials() {
  const accessKeyId = process.env.R2_ACCESS_KEY_ID ?? "";
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY ?? "";

  if (
    accessKeyId.startsWith("http://") ||
    accessKeyId.startsWith("https://")
  ) {
    return "R2_ACCESS_KEY_ID must be your R2 API token access key ID, not a URL.";
  }

  if (
    secretAccessKey.startsWith("http://") ||
    secretAccessKey.startsWith("https://")
  ) {
    return "R2_SECRET_ACCESS_KEY must be your R2 API token secret key, not a URL.";
  }

  if (accessKeyId.length !== 32) {
    return "R2_ACCESS_KEY_ID looks invalid. Create an R2 API token in Cloudflare and use the 32-character access key ID.";
  }

  if (secretAccessKey.length < 40) {
    return "R2_SECRET_ACCESS_KEY looks invalid. Use the secret key shown when you create the R2 API token.";
  }

  return null;
}
