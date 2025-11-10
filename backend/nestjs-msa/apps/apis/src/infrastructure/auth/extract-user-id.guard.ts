import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

/**
 * ExtractUserIdGuard
 *
 * JWT 토큰에서 userId를 추출하고 기본 검증을 수행하는 Guard
 *
 * 책임:
 * ✅ Authorization 헤더에서 토큰 추출
 * ✅ JWT 서명 검증
 * ✅ 토큰 만료 시간 확인
 * ✅ userId 추출 및 형식 검증
 * ✅ Request 객체에 사용자 정보 첨부
 *
 * 책임 아님:
 * ❌ 사용자 존재 여부 확인 (서비스에서 처리)
 * ❌ 사용자 권한/역할 검증 (서비스에서 처리)
 */
@Injectable()
export class ExtractUserIdGuard implements CanActivate {
  private readonly logger = new Logger(ExtractUserIdGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 1️⃣ Authorization 헤더에서 토큰 추출
    const token = this.extractTokenFromRequest(request);

    if (!token) {
      this.logger.warn("No token provided in Authorization header");
      throw new UnauthorizedException("No token provided");
    }

    try {
      // 2️⃣ JWT 토큰 검증 및 디코딩
      const secret = this.configService.get<string>("JWT_SECRET");
      if (!secret) {
        this.logger.error("JWT_SECRET is not configured");
        throw new UnauthorizedException("Server configuration error");
      }

      const decoded = this.jwtService.verify(token, { secret });

      // 3️⃣ userId 추출 및 검증
      const userId = decoded.userId;
      if (!userId) {
        this.logger.warn("Token does not contain userId");
        throw new UnauthorizedException("Invalid token payload");
      }

      // 4️⃣ Request 객체에 사용자 정보 첨부
      request.user = {
        userId,
        email: decoded.email,
        type: decoded.type, // 'access' 또는 'refresh'
      };

      this.logger.debug(`User extracted from token: ${userId}`);
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.warn(`Token verification failed: ${error.message}`);
      throw new UnauthorizedException("Invalid or expired token");
    }
  }

  /**
   * Authorization 헤더에서 Bearer 토큰 추출
   *
   * 지원 형식:
   * - Authorization: Bearer <token>
   * - Cookie에서 accessToken (선택적)
   *
   * @param request Express Request 객체
   * @returns 추출된 토큰 또는 null
   */
  private extractTokenFromRequest(request: any): string | null {
    // 1️⃣ Authorization 헤더 확인
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7); // "Bearer " 제거
    }

    // 2️⃣ 선택적: Cookie에서 accessToken 확인
    if (request.cookies?.accessToken) {
      return request.cookies.accessToken;
    }

    return null;
  }
}
