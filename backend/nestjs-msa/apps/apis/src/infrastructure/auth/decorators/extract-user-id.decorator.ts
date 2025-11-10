import { applyDecorators, UseGuards } from "@nestjs/common";
import { ExtractUserIdGuard } from "../extract-user-id.guard";

/**
 * @Auth()
 *
 * JWT 토큰 검증 및 userId 추출을 위한 복합 Decorator
 *
 * 사용법:
 * ```typescript
 * @Controller('users')
 * export class UsersController {
 *   @Get('me')
 *   @Auth()
 *   async getProfile(@Req() req: any) {
 *     const { userId } = req.user; // Guard에서 설정됨
 *     return this.usersService.getUserProfile(userId);
 *   }
 * }
 * ```
 *
 * 동작:
 * 1. ExtractUserIdGuard가 JWT 검증
 * 2. userId를 req.user에 설정
 * 3. Controller 메서드 실행
 */
export function Auth() {
  return applyDecorators(UseGuards(ExtractUserIdGuard));
}
