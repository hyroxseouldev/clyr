1. 최신 Nextjs 문서를 참고해서 개발한다.
2. Server Action 우선적으로 활용한다.
3. 비동기 함수 실행 시에는 Spinner 를 보여주고 , 결과 알림은 Sonner Toaster 로 유저에게 안내한다.
   3-1. 성공, 실패 알림에 따른 색상을 달리하여 시각적 효과를 준다.
4. UI 는 Shadncn 공용 Components 를 우선적으로 사용한다.
5. Form 데이터는 React Hook Form + Zod 로 명확한 타입 생성을 한다.
   6-1. Compoennt 또한 Shadcn UI Form 을 사용
6. DB Model 에 대한 CRUD 쿼리는 drizzle 쿼리를 사용하며 위치는 src/db/queries/modelName 이다.

7. Controller, Drizzle 쿼리는 순수하게 DB만 다룹니다. 트랜잭션도 이곳에서 다룹니다.
   7-1. 서버 액션 레이어 에서는 캐시 갱신등을 처리합니다.
