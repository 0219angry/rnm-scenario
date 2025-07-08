import ScenarioCard, { ScenarioWithRelations } from './ScenarioCard';



export default function ScenarioList({ scenarios }: { scenarios: ScenarioWithRelations[] }) {
  if (scenarios.length === 0) {
    return <p>該当するシナリオはありません。</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {scenarios.map((scenario) => (
        <ScenarioCard key={scenario.id} scenario={scenario} />
      ))}
    </div>
  );
}