# 🧩 Frontend Page Specification

> **Objective**:  
> **Representatives**: Front-End | Designer | Back-End  
> **Version**: v1.0  
> **Last Updated**: 2025-11-11  
> **Author**: raco1001

---

## 1. Overview

| Items                    | Contents                                       |
| ------------------------ | ---------------------------------------------- |
| **Page Name**            | User Profile Page                              |
| **Route Path**           | `/users/:id`                                   |
| **Layout Type**          | MainLayout                                     |
| **Description**          | 사용자의 프로필 정보를 조회 및 수정하는 페이지 |
| **Author / Last Update** | Dane / 2025-11-11                              |

---

## 2. Page Structure

```bash
UserProfilePage
 ├─ Header
 ├─ UserInfoSection
 │   ├─ AvatarUploader
 │   └─ UserForm (Input fields)
 ├─ ActivityHistorySection
 │   └─ ActivityCard (list)
 └─ Footer
```

각 구성요소는 별도 문서로 링크될 수 있음 (예: components/UserForm.md)

3. UI Components
   컴포넌트 역할 관련 파일 Props / Interface 연관 모듈
   UserForm 사용자 정보 입력 src/components/UserForm.tsx UserFormProps User
   ActivityCard 활동 내역 표시 src/components/ActivityCard.tsx Activity ActivityList
   AvatarUploader 프로필 사진 업로드 src/components/AvatarUploader.tsx onUpload(file: File) FileService

4. Feature Specification
   기능 설명 트리거 / 이벤트 상태 관리 API 연동
   프로필 불러오기 /api/users/:id 호출 후 폼 초기화 useEffect() useUserStore() GET /users/:id
   프로필 수정 변경된 정보 저장 onSubmit() useUserStore() PUT /users/:id
   프로필 이미지 업로드 이미지 업로드 후 썸네일 갱신 onUpload() 로컬 상태 POST /users/:id/avatar

5. Data Interface
   typescript
   Copy code
   interface User {
   id: number;
   name: string;
   email: string;
   avatarUrl?: string;
   createdAt: string;
   updatedAt: string;
   }

interface Activity {
id: number;
type: 'POST' | 'COMMENT' | 'LIKE';
createdAt: string;
}
각 컴포넌트에서 사용하는 DTO, Response 타입, Store 구조 명시

6. Related Files
   구분 파일 경로 설명
   Page Component src/pages/UserProfilePage.tsx 페이지 진입 컴포넌트
   Styles src/styles/user-profile.css 페이지 전용 스타일
   Store / State src/store/userStore.ts Zustand/Recoil/Redux 상태 관리
   API Service src/services/userService.ts axios/fetch 래퍼
   Test File src/**tests**/UserProfilePage.test.tsx 유닛/통합 테스트 코드

7. UX / UI Notes
   로딩 상태: Skeleton or Spinner (중앙 정렬)

에러 처리: Toast 메시지 (상단 우측)

모바일 대응: 375px 기준 Flex 전환

접근성 고려사항: form label 연결, 키보드 포커스 이동

8. Dependency & Integration
   항목 설명
   Global Store useUserStore()를 통해 사용자 상태 공유
   Shared Components Button, Modal, FormInput 등 공통 컴포넌트
   External Library react-hook-form, react-query, axios
   Backend API Spec Link 🔗 Swagger Docs

9. Open Issues / TODO
   항목 상태 담당자 비고
   반응형 전환 시 form 간격 깨짐 🟡 진행중 Jane CSS min-width 수정 예정
   활동 내역 페이징 처리 ⚪ 예정 Dane 무한스크롤 적용 고려

10. Change Log
    버전 일자 변경 내용 작성자
    v1.0 2025-11-11 최초 작성 Dane
    v1.1 2025-11-12 API 스펙 업데이트 Dane

11. References
    Design File: Figma Link

Backend Contract: GET /users/:id, PUT /users/:id

QA Checklist: /docs/qa/user-profile.md
