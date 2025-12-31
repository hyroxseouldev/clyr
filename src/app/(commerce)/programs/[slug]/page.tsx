import { getProgramBySlugAction } from "@/actions";

/**
 * 상품 구매 페이지
 */
const PublicCommercePage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const { data: program } = await getProgramBySlugAction(slug);

  if (!program) {
    return <div>상품을 찾을 수 없습니다.</div>;
  }

  return <div>{JSON.stringify(program)}</div>;
};

export default PublicCommercePage;
