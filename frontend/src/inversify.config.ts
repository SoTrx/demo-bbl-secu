import { Container } from "inversify";
import { TYPES } from "@/types";
import { BackendService } from "@/services/backend.service";
import { IBackend } from "@/@types/backend.service";
import { BackendServiceMock } from "@/services/mocks/backend.service.mock";
import { AuthServiceMock } from "@/services/mocks/auth.service.mock";
import { IAuth } from "@/@types/auth.service";
import { AuthService } from "@/services/auth.service";
import { IAdmin } from "@/@types/admin.service";
import { AdminServiceMock } from "@/services/mocks/admin.service.mock";
import { AdminService } from "@/services/admin.service";
export const container = new Container();

console.log("env.VUE_APP_USE_KV");
console.log(process.env.VUE_APP_USE_KV);
const useKV = process.env.VUE_APP_USE_KV === "1";
const useAuth = process.env.VUE_APP_USE_AUTH === "1";
container
  .bind<IBackend>(TYPES.BackendService)
  .toConstantValue(new BackendServiceMock());

const adminService = useKV
  ? new AdminService(window.location.origin)
  : new AdminServiceMock();

container.bind<IAdmin>(TYPES.AdminService).toConstantValue(adminService);

const authService = useAuth ? new AuthService() : new AuthServiceMock(false);

/*container
    .bind<IAuth>(TYPES.AuthService)
    .toConstantValue();*/

container.bind<IAuth>(TYPES.AuthService).toConstantValue(authService);
