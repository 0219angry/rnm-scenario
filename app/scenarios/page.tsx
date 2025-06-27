import { Suspense } from 'react';
import ScenarioList from '@/components/features/scenarios/ScenarioList';
import ScenarioFilter from '@/components/features/scenarios/ScenarioFilter';
import { fetchScenarios } from '@/lib/data'; // 作成した関数をインポート
import Link from 'next/link';

type ScenariosPageProps = {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<{ [key:string]: string | string[] | undefined }>;
};

export default async function ScenariosPage({
   searchParams
}: ScenariosPageProps) {
  // 分離したデータ取得関数を呼び出す
  const scenarios = await fetchScenarios(await searchParams);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">シナリオ一覧</h1>
        <Link
          href="/scenarios/new"
          className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
        >
          ＋ 新規作成
        </Link>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4">
          {/*
            ScenarioFilterは内部で `useSearchParams` を使うクライアントコンポーネントになることが多いため、
            Suspenseでラップするのは良い設計です。
           */}
          <Suspense>
            <ScenarioFilter />
          </Suspense>
        </aside>
        <main className="w-full md:w-3/4">
          {/*
            データ取得(await fetchScenarios)が完了してからレンダリングされるため、
            このSuspenseのfallbackが表示されることは通常ありません。
            しかし、UIコンポーネントの読み込み自体が遅い場合や、
            一貫性のために配置しておくのは問題ありません。
           */}
          <Suspense fallback={<p>シナリオを読み込んでいます...</p>}>
            <ScenarioList scenarios={scenarios} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}