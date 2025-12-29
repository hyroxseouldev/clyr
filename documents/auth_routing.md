# App Routing

코치 유저와 회원 유저가 함께 사용할수 있기 때문에

그룹 라우팅으로 디렉토리를 관리 하고

Middleware 로 앱 사용시 유저 접근을 제한 합니다

# Role

롤은 어드민, 코치, 일반 유저

/랜딩 페이지
/404

(Auth)

/signin
/signup

서치파라미터로 코치와 유저 구분
전체 접근 가능

(Coach)

코치 유저만 접근 가능

/dashboard 이하 모두

/coach/onboarding

(User)

/user/program/[slug]

/user/checkout/success

/user/checkout/failure

/user/signin

/user/signup
