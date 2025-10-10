import { users } from "@app/contracts";
import { Observable } from "rxjs";

export abstract class UsersCommandPort
  implements Partial<users.UsersServiceClient>
{
  abstract createUser(request: users.CreateUserRequest): Observable<users.User>;
  abstract updateUser(request: users.UpdateUserRequest): Observable<users.User>;
  abstract deleteUser(
    request: users.FindOneUserRequest,
  ): Observable<users.User>;
}
