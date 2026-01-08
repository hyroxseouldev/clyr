import { getRoutineBlockByIdAction } from "@/actions/routineBlock";
import { notFound } from "next/navigation";
import { BlockDetailClient } from "./_components/block-detail-client";
import type { RoutineBlockWithItems } from "@/db/queries/routineBlock";

const BlockDetailPage = async ({
  params,
}: {
  params: Promise<{ pid: string; blockId: string }>;
}) => {
  const { blockId } = await params;

  // 블록 정보 조회
  const blockResult = await getRoutineBlockByIdAction(blockId);

  if (!blockResult.success || !blockResult.data) {
    return notFound();
  }

  // RoutineBlockWithItems 타입으로 변환
  const block: RoutineBlockWithItems = {
    ...blockResult.data,
    itemCount: blockResult.data.items.length,
    items: blockResult.data.items.map((item) => ({
      id: item.id,
      blockId: item.blockId || blockId,
      libraryId: item.libraryId,
      libraryTitle: item.library?.title || null,
      orderIndex: item.orderIndex,
      recommendation: item.recommendation as Record<string, unknown> | null,
    })),
  };

  return (
    <BlockDetailClient
      block={block}
    />
  );
};

export default BlockDetailPage;
