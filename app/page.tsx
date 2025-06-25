export default function Home() {
  // ダミーデータ
  const newScenarios = [
    { id: 1, title: "最初の事件", playerMin: 3, playerMax: 4, requiresGM: true },
    { id: 2, title: "閉ざされた山荘", playerMin: 4, playerMax: 5, requiresGM: false },
    { id: 3, title: "都市伝説の真相", playerMin: 2, playerMax: 3, requiresGM: true },
  ];

  const upcomingSessions = [
    { id: 1, scenario: "最初の事件", scheduledAt: "2025-07-01T19:00" },
    { id: 2, scenario: "閉ざされた山荘", scheduledAt: "2025-07-05T20:00" },
    { id: 3, scenario: "最初の事件", scheduledAt: "2025-07-10T21:00" },
  ];

  return (
    <div>
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">新着シナリオ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {newScenarios.map((scenario) => (
            <div key={scenario.id} className="border p-4 rounded-lg">
              <h3 className="text-lg font-bold">{scenario.title}</h3>
              <p>人数: {scenario.playerMin}〜{scenario.playerMax}人</p>
              <p>GM: {scenario.requiresGM ? "必要" : "不要"}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">セッション予定</h2>
        <ul>
          {upcomingSessions.map((session) => (
            <li key={session.id} className="border-b py-2">
              <p className="font-bold">{session.scenario}</p>
              <p>日時: {new Date(session.scheduledAt).toLocaleString('ja-JP')}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}