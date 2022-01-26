import { Container } from "inversify";
import { TYPES } from "@/types";
import { BackendService } from "@/services/backend.service";
import { IBackend } from "@/@types/backend.service";
import { BackendServiceMock } from "@/services/mocks/backend.service.mock";
import { AuthServiceMock } from "@/services/mocks/auth.service.mock";
import { IAuth } from "@/@types/auth.service";
import { env } from "process";
import { AuthService } from "@/services/auth.service";
import { IAdmin } from "@/@types/admin.service";
import { AdminServiceMock } from "@/services/mocks/admin.service.mock";
import { AdminService } from "@/services/admin.service";
export const container = new Container();

container
  .bind<IBackend>(TYPES.BackendService)
  .toConstantValue(new BackendServiceMock());

container
  .bind<IAdmin>(TYPES.AdminService)
  .toConstantValue(new AdminService(window.location.origin));

/*container
  .bind<IBackend>(TYPES.BackendService)
  .toConstantValue(
    new BackendService(
      "https://pingouin-apim.azure-api.net",
      "e5297e46374b42379ecc470ca06e8db8"
    )
  );*/

/*container
    .bind<IAuth>(TYPES.AuthService)
    .toConstantValue(new AuthServiceMock(true));*/

container.bind<IAuth>(TYPES.AuthService).toConstantValue(new AuthService());
