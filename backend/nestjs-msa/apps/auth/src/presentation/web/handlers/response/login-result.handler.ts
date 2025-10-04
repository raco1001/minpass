export class LoginResultHandler {
  static getSuccessScript(response: any, targetOrigin: string): string {
    return `
      <script>
        if (window.opener) {
          window.opener.postMessage(${JSON.stringify(response)}, '${targetOrigin}');
          window.close();
        } else {
          document.body.innerHTML = '<h1>잘못된 접근으로 로그인을 시도했습니다.</h1>';
        }
      </script>
    `;
  }

  static getErrorScript(errorMessage: string): string {
    const safeErrorMessage = errorMessage
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");

    return `
      <script>
        document.body.innerHTML = '<h1>로그인에 실패했습니다: ${safeErrorMessage}</h1>';
        setTimeout(() => window.close(), 3000);
      </script>
    `;
  }

  static handle(provider: string, response: any, redirectUrl: string): string {
    switch (provider) {
      case "kakao":
      case "google":
      case "github":
        return this.getSuccessScript(response, redirectUrl);
      default:
        return this.getErrorScript("지원하지 않는 플랫폼입니다.");
    }
  }
}
