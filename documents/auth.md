# 인증 계획

- Mvp 개발로 완성이 우선이기에 supabase 에서 제공하는 패키지을 적극 활용합니다

참고 링크: https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=package-manager&package-manager=pnpm&queryGroups=framework&framework=nextjs

# 필요 함수

Server Actions 활용

유저 정보 불러오기

유저 이메일 가입(코치)

유저 이메일 가입(회원)

유저 이메일 로그인

유저 정보 수정

유저 정보 삭제

# 위치

src/lib/auth 폴더에서 인증 관련 파일을 전부 관리 합니다

서버 액션과 공통 컴포넌트 Supabase 관련 함수
