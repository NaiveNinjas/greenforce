import { useState } from "react";
import { Button, Grid, Column, Tile, Heading, Section } from "@carbon/react";
import MetricCard from "../components/MetricCard";
import {
  Critical,
  EmissionsManagement,
  EnergyRenewable,
  IbmUnstructuredDataProcessor,
  Important,
  TrashCan,
  VersionMajor,
  VersionMinor,
} from "@carbon/icons-react";

interface Metrics {
  co2_emissions: number;
  waste_level: number;
  energy_usage: number;
}

export default function Home() {
  const [metrics, setMetrics] = useState<Metrics>({
    co2_emissions: 105,
    waste_level: 75,
    energy_usage: 13500,
  });
  const [response, setResponse] = useState<any>(null);

  const analyze = async () => {
    const res = await fetch("http://localhost:8000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(metrics),
    });
    const data = await res.json();
    setResponse(data);
  };

  return (
    <Grid fullWidth style={{ marginTop: "2rem" }}>
      <Column sm={4} md={8} lg={16}>
        <Heading>🌿 GreenForce Sustainability Dashboard</Heading>
      </Column>

      <Column sm={4} md={8} lg={16} style={{ marginTop: "1rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3 style={{ margin: 0 }}>Overview</h3>
            <p style={{ margin: 0, color: "#a2a9b0" }}>
              Explore key metrics and recent activity across sites
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button
              kind="ghost"
              renderIcon={IbmUnstructuredDataProcessor}
              iconDescription="CO₂ Insights"
            >
              All
            </Button>
            <Button
              kind="ghost"
              style={{ color: "#da1e28" }}
              renderIcon={Critical}
            >
              Critical
            </Button>
            <Button
              kind="ghost"
              style={{ color: "#ff832b" }}
              renderIcon={VersionMajor}
            >
              Major
            </Button>
            <Button
              kind="ghost"
              style={{ color: "#f1c21b" }}
              renderIcon={VersionMinor}
            >
              Minor
            </Button>
          </div>
        </div>
      </Column>

      <Column sm={4} md={8} lg={16}>
        <div style={{ display: "flex", gap: "2rem", marginTop: "2rem" }}>
          <MetricCard
            name="CO₂ Emissions (tons)"
            value={metrics.co2_emissions}
            icon={<EmissionsManagement size={32} fill={"#42be65"} />}
          />
          <MetricCard
            name="Waste Level (%)"
            value={metrics.waste_level}
            icon={<TrashCan size={32} fill={"#da1e28"} />}
          />
          <MetricCard
            name="Energy Usage (kWh)"
            value={metrics.energy_usage}
            icon={<EnergyRenewable size={32} fill={"#be95ff"} />}
          />
        </div>

        <Button
          onClick={analyze}
          kind="primary"
          size="lg"
          style={{ marginTop: "2rem" }}
        >
          Analyze & Trigger Workflows
        </Button>

        {response && (
          <Tile style={{ marginTop: "2rem" }}>
            <Heading>Triggered Workflows</Heading>
            <pre style={{ color: "white" }}>
              {JSON.stringify(response, null, 2)}
            </pre>
          </Tile>
        )}
      </Column>
    </Grid>
  );
}
