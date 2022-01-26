import { Context, HttpRequest } from "@azure/functions";
import { ManagedIdentityCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";
import { env } from "process";

export async function httpTrigger(
  ctx: Context,
  req: HttpRequest
): Promise<any> {
  ctx.log("HTTP trigger function processed a request.");
  try {
    // Gather all required env vars
    const [vaultName, secretName] = ["VAULT_NAME", "SECRET_NAME"].map(
      (varName) => getEnvVar(varName, ctx)
    );
    ctx.log.info(`Fetching secret ${secretName} from ${vaultName}`);

    // Authenticate to the keyvault using the function managed identity
    const credential = new ManagedIdentityCredential();
    const keyvaultUrl = `https://${vaultName}.vault.azure.net`;
    const client = new SecretClient(keyvaultUrl, credential);
    // Get the secret from the keyvault and returns it
    const secret = await client.getSecret(secretName);
    ctx.log.info(`Secret is ${secret.value}`);
    if (secret.value === undefined)
      throw new Error("Could not retrieve secret");
    return formatReply(JSON.stringify({ secret: secret.value }), 200, {
      "Content-Type": "application/JSON",
    });
  } catch (e) {
    // No matter what fails it's a server error, there are no user inputs whatsoever
    return formatReply(JSON.stringify({ error: e }), 500);
  }
}

/**
 * Use a message
 * @param message
 * @param statusCode
 * @returns
 */
function formatReply(
  message: any,
  statusCode = 200,
  headers?: Record<string, any>
): Record<string, any> {
  const res: Record<string, any> = {
    status: statusCode,
    body: message,
  };
  res.headers = headers;
  return res;
}

/**
 * Safely retrieve a var from the environment.
 * @param varName Name of the env variable
 * @param fallback Fallback value
 * @param ctx used to issue a warning when a variable isn't defined
 * @returns the var value of a fallback
 */
function getEnvVar<T>(varName: string, ctx: Context, fallback?: T): T {
  const envVar = env[varName];
  if (envVar === undefined) {
    if (fallback !== undefined) {
      ctx.log.warn(`${varName} isn't defined ! Defaulting to ${fallback}.`);
      return fallback;
    }
    ctx.log.error(`${varName} isn't defined but is required ! Aborting ! `);
    throw new Error(`${varName} missing`);
  }
  return envVar as unknown as T;
}
