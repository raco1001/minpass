import { Logger } from "@nestjs/common";

export interface UserFriendlyError {
  userMessage: string;
  technicalMessage: string;
  errorCode?: string;
}

export class AuthErrorHandler {
  private static readonly logger = new Logger(AuthErrorHandler.name);

  private static extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === "string") {
      return error;
    }

    if (error && typeof error === "object" && "message" in error) {
      return String(error.message);
    }

    return "알 수 없는 오류가 발생했습니다.";
  }

  private static mapToUserFriendlyMessage(technicalMessage: string): string {
    const errorMappings: Record<string, string> = {
      "Provider not found": "지원하지 않는 로그인 방식입니다.",
      "Role not found": "시스템 오류가 발생했습니다. 관리자에게 문의해주세요.",
      "Failed to create user":
        "회원가입 중 오류가 발생했습니다. 다시 시도해주세요.",
      Unauthorized: "로그인이 필요합니다.",
      Forbidden: "접근 권한이 없습니다.",

      "Connection failed":
        "일시적인 서버 오류입니다. 잠시 후 다시 시도해주세요.",
      Timeout: "요청 시간이 초과되었습니다. 다시 시도해주세요.",

      access_denied: "로그인을 취소하셨습니다.",
      invalid_request: "잘못된 요청입니다. 다시 시도해주세요.",
      server_error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",

      "Network Error": "네트워크 연결을 확인하고 다시 시도해주세요.",
      ECONNREFUSED: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.",
    };

    if (errorMappings[technicalMessage]) {
      return errorMappings[technicalMessage];
    }

    for (const [key, userMessage] of Object.entries(errorMappings)) {
      if (technicalMessage.toLowerCase().includes(key.toLowerCase())) {
        return userMessage;
      }
    }

    return "로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }

  static handleError(error: unknown, context?: string): UserFriendlyError {
    const technicalMessage = this.extractErrorMessage(error);
    const userMessage = this.mapToUserFriendlyMessage(technicalMessage);

    this.logger.error(
      `${context ? `[${context}] ` : ""}${technicalMessage}`,
      error instanceof Error ? error.stack : undefined,
    );

    return {
      userMessage,
      technicalMessage,
      errorCode: this.generateErrorCode(technicalMessage),
    };
  }

  private static generateErrorCode(message: string): string {
    const timestamp = Date.now().toString(36);
    const hash = message.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

    return `ERR_${timestamp}_${Math.abs(hash).toString(36).toUpperCase()}`;
  }
}
