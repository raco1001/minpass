import { join } from "path";

import { ClientGrpc, Transport, Client } from "@nestjs/microservices";
import { Observable } from "rxjs";

interface UserServiceClient {
  createUser(req: any): Observable<any>;
  getUser(req: any): Observable<any>;
}

export class UsersGrpcClient {
  @Client({
    transport: Transport.GRPC,
    options: {
      package: "users.v1",
      protoPath: join(__dirname, "../proto/users/v1/users.proto"),
      url: "users:50051",
    },
  })
  private client!: ClientGrpc;

  private svc!: UserServiceClient;
  onModuleInit() {
    this.svc = this.client.getService<UserServiceClient>("UserService");
  }

  createUser(dto: {
    id: Buffer;
    email: string;
    display_name?: string;
    idempotency_key?: string;
  }) {
    return this.svc.createUser(dto);
  }
}
