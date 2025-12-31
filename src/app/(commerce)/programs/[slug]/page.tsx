import { getProgramBySlugAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, Calendar, TrendingUp, CheckCircle2, User, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

/**
 * 프로그램 상세 및 구매 페이지
 */
const PublicCommercePage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const { data: program } = await getProgramBySlugAction(slug);

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">상품을 찾을 수 없습니다</h1>
          <p className="text-gray-600 mt-2">
            요청하신 페이지가 존재하지 않습니다.
          </p>
        </div>
      </div>
    );
  }

  const difficultyColors = {
    BEGINNER: "bg-green-100 text-green-800",
    INTERMEDIATE: "bg-yellow-100 text-yellow-800",
    ADVANCED: "bg-red-100 text-red-800",
  };

  const difficultyLabels = {
    BEGINNER: "입문",
    INTERMEDIATE: "중급",
    ADVANCED: "고급",
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge>{program.type === "SINGLE" ? "단건 판매" : "구독형"}</Badge>
            <Badge
              variant={program.isPublic ? "default" : "secondary"}
              className={cn(
                "gap-1",
                program.isPublic
                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              )}
            >
              {program.isPublic ? (
                <>
                  <Eye className="h-3 w-3" />
                  공개
                </>
              ) : (
                <>
                  <EyeOff className="h-3 w-3" />
                  비공개
                </>
              )}
            </Badge>
            {!program.isForSale && (
              <Badge variant="outline" className="text-gray-500">
                판매 중지
              </Badge>
            )}
          </div>
          <h1 className="text-4xl font-bold mb-4">{program.title}</h1>
          <p className="text-xl text-gray-600">{program.shortDescription}</p>
        </div>

        {/* 썸네일 */}
        {program.thumbnailUrl && (
          <div className="mb-8 rounded-lg overflow-hidden border">
            <img
              src={program.thumbnailUrl}
              alt={program.title}
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        {/* 메타 정보 */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4 border rounded">
            <TrendingUp className="h-5 w-5 mx-auto mb-2 text-gray-600" />
            <div className="text-sm text-gray-600">난이도</div>
            <Badge
              className={cn(
                difficultyColors[program.difficulty],
                "mt-1 text-sm"
              )}
            >
              {difficultyLabels[program.difficulty]}
            </Badge>
          </div>
          <div className="text-center p-4 border rounded">
            <Calendar className="h-5 w-5 mx-auto mb-2 text-gray-600" />
            <div className="text-sm text-gray-600">총 기간</div>
            <div className="font-bold mt-1">{program.durationWeeks}주</div>
          </div>
          <div className="text-center p-4 border rounded">
            <Clock className="h-5 w-5 mx-auto mb-2 text-gray-600" />
            <div className="text-sm text-gray-600">주당 운동</div>
            <div className="font-bold mt-1">{program.daysPerWeek}일</div>
          </div>
          <div className="text-center p-4 border rounded">
            <User className="h-5 w-5 mx-auto mb-2 text-gray-600" />
            <div className="text-sm text-gray-600">수강 기간</div>
            <div className="font-bold mt-1">
              {program.accessPeriodDays
                ? `${program.accessPeriodDays}일`
                : "평생"}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 메인 컨텐츠 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 상세 설명 */}
            {program.description && (
              <section>
                <h2 className="text-2xl font-bold mb-4">프로그램 상세</h2>
                <div
                  className="prose max-w-none p-6 border rounded"
                  dangerouslySetInnerHTML={{ __html: program.description }}
                />
              </section>
            )}

            {/* 커리큘럼 */}
            {program.weeks && program.weeks.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4">커리큘럼</h2>
                <div className="space-y-3">
                  {program.weeks.map((week) => (
                    <Card key={week.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-sm">
                            {week.weekNumber}
                          </div>
                          <CardTitle className="text-lg">
                            {week.title}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      {week.description && (
                        <CardContent className="pt-0">
                          <p className="text-sm text-gray-600">
                            {week.description}
                          </p>
                        </CardContent>
                      )}
                      {week.workouts && week.workouts.length > 0 && (
                        <CardContent className="pt-0">
                          <div className="flex flex-wrap gap-2">
                            {week.workouts.map((workout) => (
                              <Badge key={workout.id} variant="outline">
                                Day {workout.dayNumber}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 코치 정보 */}
            {program.coach && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">코치 소개</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                      {program.coach.fullName?.charAt(0) || "C"}
                    </div>
                    <div>
                      <div className="font-bold">{program.coach.fullName}</div>
                      <Badge variant="outline" className="text-xs">
                        코치
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 구매 카드 */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <div className="text-sm text-gray-600">결제 금액</div>
                  <div className="text-3xl font-bold mt-1">
                    {Number(program.price).toLocaleString()}원
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gray-600" />
                    <span>전문 코치의 피드백</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gray-600" />
                    <span>체계적인 커리큘럼</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gray-600" />
                    <span>언제든지 접근 가능</span>
                  </div>
                </div>

                {program.isForSale ? (
                  <Button asChild className="w-full" size="lg">
                    <Link href={`/programs/payment/${slug}`}>
                      구매하기
                    </Link>
                  </Button>
                ) : (
                  <Button disabled className="w-full" size="lg">
                    현재 판매하지 않습니다
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicCommercePage;
