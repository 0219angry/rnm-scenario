import { useEffect, useState } from "react";
import { Genre } from "@prisma/client";

type Scenario = {
  id: string;
  title: string;
  genre: Genre;
  playerMin: number;
  playerMax: number;
};

type ScenarioSelectorProps = {
  value: string | undefined;
  onChange: (id: string | undefined) => void;
  scenarios: Scenario[];
  genres?: Genre[];
  playerCount?: number;
};

const genreMap = {
  [Genre.MADAMIS]: 'マダミス',
  [Genre.TRPG]: 'TRPG',
  [Genre.OTHER]: 'その他',
};

export function ScenarioSelector({
  value,
  onChange,
  scenarios,
  genres,
  playerCount,
}: ScenarioSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // 💡 絞り込みロジック
  const filteredScenarios = scenarios.filter((s) => {
    const genreMatch = !genres || genres.length === 0 || genres.includes(s.genre);
    const playerMatch = !playerCount || (s.playerMin <= playerCount && playerCount <= s.playerMax);
    const titleMatch = s.title.toLowerCase().includes(searchTerm.toLowerCase());
    return genreMatch && playerMatch && titleMatch;
  });

  useEffect(() => {
    // 選択中の値が絞り込み後に存在しなければ解除
    if (value && !filteredScenarios.find((s) => s.id === value)) {
      onChange(undefined);
    }
  }, [filteredScenarios, value, onChange]);

  return (
    <div className="space-y-4">
      {/* 🔍 検索欄 */}
      <div>
        <label htmlFor="scenarioSearch" className="block mb-2 text-sm font-medium text-gray-700">
          シナリオ名で検索
        </label>
        <input
          id="scenarioSearch"
          type="text"
          placeholder="キーワードを入力..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 bg-gray-100 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* 🎴 一覧から選択 */}
      <div className="grid gap-2 sm:grid-cols-2">
        {filteredScenarios.map((scenario) => {
          const isSelected = scenario.id === value;
          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => onChange(scenario.id)}
              className={`p-3 rounded-md border transition
                ${isSelected ? "bg-blue-100 border-blue-500" : "bg-white border-gray-300"}
                hover:bg-blue-50`}
            >
              <div className="font-semibold">{scenario.title}</div>
              <div className="text-sm text-gray-500">
                {genreMap[scenario.genre]} / {scenario.playerMin===scenario.playerMax ? scenario.playerMin : `${scenario.playerMin}〜${scenario.playerMax}`}人
              </div>
            </button>
          );
        })}
        {filteredScenarios.length === 0 && (
          <div className="text-sm text-gray-500">該当するシナリオがありません</div>
        )}
      </div>
    </div>
  );
}

export default ScenarioSelector;
