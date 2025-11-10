/**
 * AuthenticatedRequest
 *
 * Guard에 의해 처리된 요청의 타입
 * req.user에 userId 등이 설정되어 있음
 */
export interface AuthenticatedRequest extends Express.Request {
  user: {
    userId: string;
    email?: string;
    type?: "access" | "refresh";
  };
}
