import { useState } from 'react';
import { Button, Grid, Column, Tile, Heading } from '@carbon/react';
import MetricCard from '../components/MetricCard';

interface Metrics {
  co2_emissions: number;
  waste_level: number;
  energy_usage: number;
}

export default function Home() {
  const [metrics, setMetrics] = useState<Metrics>({
    co2_emissions: 105,
    waste_level: 75,
    energy_usage: 13500
  });
  const [response, setResponse] = useState<any>(null);

  const analyze = async () => {
    const res = await fetch('http://localhost:8000/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics)
    });
    const data = await res.json();
    setResponse(data);
  };

  return (
    <Grid fullWidth style={{ marginTop: '2rem' }}>
      <Column sm={4} md={8} lg={16}>
        <Heading>🌿 GreenForce Sustainability Dashboard</Heading>
      </Column>

      <Column sm={4} md={8} lg={16}>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <MetricCard name="CO₂ Emissions (tons)" value={metrics.co2_emissions} />
          <MetricCard name="Waste Level (%)" value={metrics.waste_level} />
          <MetricCard name="Energy Usage (kWh)" value={metrics.energy_usage} />
        </div>

        <Button onClick={analyze} kind="primary" size="lg" style={{ marginTop: '2rem' }}>
          Analyze & Trigger Workflows
        </Button>

        {response && (
          <Tile style={{ marginTop: '2rem' }}>
            <Heading>Triggered Workflows</Heading>
            <pre style={{ color: 'white' }}>{JSON.stringify(response, null, 2)}</pre>
          </Tile>
        )}
      </Column>
    </Grid>
  );
}
