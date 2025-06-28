
import { NewScenarioForm } from "@/components/features/scenarios/NewScenarioForm";
import { prisma } from "@/lib/prisma";

// Rulebookの型定義
type Rulebook = {
  id: string;
  name: string;
};

// getRulebooks関数を、fetchではなく直接Prismaを呼ぶように修正
async function getRulebooks(): Promise<Rulebook[]> {
  try {
    // APIルートで行っていた処理をここに直接記述
    const rulebooks = await prisma.rulebook.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return rulebooks;
  } catch (error) {
    console.error("Failed to fetch rulebooks from DB:", error);
    return []; // エラー時は空の配列を返す
  }
}

// ページコンポーネント (変更なし)
export default async function NewScenarioPage() {
  const rulebooks = await getRulebooks();

  return (
    <div className="container mx-auto py-10">
      <NewScenarioForm rulebooks={rulebooks} />
    </div>
  );
}