import { Context, HttpRequest } from "@azure/functions";

export default async function httpTrigger(
  ctx: Context,
  req: HttpRequest
): Promise<any> {
  const user = req.body || {};
  ctx.log("HTTP trigger function processed a request.");
  let roles: string[] = [];
  ctx.log.info("Got user ");
  ctx.log.info(user);

  // Default roles
  roles.push(...["anonymous", "authenticated"]);
  ctx.log.info(`Found basic roles : ${roles.join(", ")}`);
  if (user?.claims?.length > 0) {
    const customRoles = user?.claims
      ?.filter(
        (c) => c.typ.includes("identity/claims/role") || c.typ === "roles"
      )
      ?.map((c) => c.val);
    ctx.log.info(`Found custom roles : ${customRoles.join(", ")}`);
    if (customRoles.length > 0) roles.push(...customRoles);
  }
  roles = roles.filter((r) => r !== undefined);

  ctx.res.json({
    roles,
  });
}
