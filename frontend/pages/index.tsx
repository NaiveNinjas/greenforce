'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Grid,
  Column,
  Heading,
  Tabs,
  Tab,
  Tile,
  TabList,
  TabPanels,
  TabPanel
} from '@carbon/react';
import MetricCard from '../components/MetricCard';
import ChatBox from '../components/ChatBox';
import {
  CartesianGrid,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  EmissionsManagement,
  EnergyRenewable,
  TrashCan
} from "@carbon/icons-react";

interface Metrics {
  timestamp?: string;
  co2_emissions: number;
  waste_level: number;
  energy_usage: number;
}

export default function Home() {
  const [metrics, setMetrics] = useState<Metrics>({
    co2_emissions: 0,
    waste_level: 0,
    energy_usage: 0,
  });
  const [history, setHistory] = useState<any[]>([]);
  const [miniChartData, setMiniChartData] = useState<any[]>([]);
  const [similar, setSimilar] = useState<any[]>([]);
  const [response, setResponse] = useState<any>(null);
  const [analyzeResponse, setAnalyzeResponse] = useState<any>(null);
  const [isLive, setIsLive] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // --- LIVE DATA STREAM (SSE) ---
  useEffect(() => {
    const eventSource = new EventSource('http://localhost:8000/stream');
    setIsLive(true);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMetrics(data);

        // update mini live chart
        setMiniChartData((prev) => {
          const updated = [...prev, { time: new Date().toLocaleTimeString(), ...data }];
          if (updated.length > 10) updated.shift();
          return updated;
        });
      } catch (e) {
        console.error('Error parsing SSE data', e);
      }
    };

    eventSource.onerror = () => {
      setIsLive(false);
      eventSource.close();
    };

    return () => eventSource.close();
  }, []);

  // --- ANALYZE WORKFLOWS ---
  const analyze = async () => {
    try {
      const res = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics),
      });
      const data = await res.json();
      setAnalyzeResponse(data);
    } catch (e) {
      console.error('Analyze error', e);
    }
  };

  // --- FETCH HISTORY ---
  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:8000/history');
      const data = await res.json();
      const prepared = (data.history || []).map((d: any) => ({
        timestamp: d.timestamp,
        co2_emissions: d.co2_emissions,
        waste_level: d.waste_level,
        energy_usage: d.energy_usage,
      }));
      setHistory(prepared);
    } catch (e) {
      console.error('History fetch error', e);
      setHistory([]);
    }
  };

  const findSimilar = async () => {
    try {
      const res = await fetch('http://localhost:8000/similar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics),
      });
      const data = await res.json();
      setSimilar(data.similar || []);
    } catch (e) {
      console.error('Find similar error', e);
      setSimilar([]);
    }
  };

  useEffect(() => {
    if (activeTab === 1) {
      fetchHistory();
    }
  }, [activeTab]);

  // --- FORECAST TAB (Watsonx.ai) ---
  const fetchForecast = async () => {
    try {
      const res = await fetch('http://localhost:8000/forecast');
      const data = await res.json();
      setResponse({ forecast: data.forecast, structured: data.structured });
    } catch (e) {
      setResponse({ forecast: 'Unable to fetch forecast.', structured: [] });
    }
  };

  useEffect(() => {
    fetchForecast();
    const interval = setInterval(fetchForecast, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Grid fullWidth style={{ marginTop: '2rem' }}>
      <Column sm={4} md={8} lg={16}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Heading>🌿 GreenForce Sustainability Assistant</Heading>
          <span style={{ color: isLive ? 'limegreen' : 'gray', fontWeight: 600 }}>
            ● {isLive ? 'Live data streaming' : 'Offline'}
          </span>
        </div>
      </Column>

      <Column sm={4} md={8} lg={16}>
        <Tabs selectedIndex={activeTab} onChange={(data) => setActiveTab(data.selectedIndex)}>
          <TabList scrollDebounceWait={200}>
            <Tab>Dashboard</Tab>
            <Tab>History</Tab>
            <Tab>Forecast</Tab>
          </TabList>

          <TabPanels>
            {/* --- DASHBOARD TAB --- */}
            <TabPanel id="dashboard">
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

              {/* Mini real-time animated chart */}
              <div style={{ marginTop: '2rem', height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={miniChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="co2_emissions"
                      name="CO₂ Emissions"
                      stroke="#2B7AE4"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="waste_level"
                      name="Waste Level"
                      stroke="#7B61FF"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="energy_usage"
                      name="Energy Usage"
                      stroke="#00B3A6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <Button onClick={analyze} kind="primary" size="lg" style={{ marginTop: '2rem' }}>
                Analyze & Trigger Workflows
              </Button>

              {analyzeResponse && (
                <Tile style={{ marginTop: '2rem', padding: '1rem' }}>
                  <Heading>🧠 Recommendations</Heading>
                  <p style={{ color: '#00ff88', whiteSpace: 'pre-line', marginTop: '0.5rem' }}>
                    {analyzeResponse.recommendation || 'Awaiting recommendation...'}
                  </p>

                  <Heading style={{ marginTop: '1.25rem' }}>⚙️ Triggered Workflows</Heading>
                  <pre style={{ color: 'white' }}>{JSON.stringify(analyzeResponse.actions, null, 2)}</pre>
                </Tile>
              )}
            </TabPanel>

            {/* --- HISTORY TAB --- */}
            <TabPanel id="history">
              <div style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <Button kind="secondary" onClick={findSimilar}>
                    Find Similar Patterns
                  </Button>
                  <Button kind="tertiary" onClick={fetchHistory}>
                    Refresh History
                  </Button>
                </div>

                <div style={{ marginTop: '1rem', height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history}>
                      <XAxis dataKey="timestamp" hide />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="co2_emissions" name="CO₂ (tons)" stroke="#ff6666" dot={false} />
                      <Line type="monotone" dataKey="waste_level" name="Waste (%)" stroke="#ffaa00" dot={false} />
                      <Line type="monotone" dataKey="energy_usage" name="Energy (kWh)" stroke="#66ff66" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {similar.length > 0 && (
                  <Tile style={{ marginTop: '2rem' }}>
                    <Heading>🔍 Similar Sustainability Patterns</Heading>
                    <pre style={{ color: 'white' }}>{JSON.stringify(similar, null, 2)}</pre>
                  </Tile>
                )}
              </div>
            </TabPanel>

            {/* --- FORECAST TAB --- */}
            <TabPanel id="forecast">
              <div style={{ marginTop: '2rem' }}>
                <Button kind="primary" onClick={fetchForecast}>
                  Refresh Forecast
                </Button>

                {response?.forecast && (
                  <Tile style={{ marginTop: '2rem', padding: '1rem' }}>
                    <Heading>📈 Sustainability Forecast (7 Days)</Heading>
                    <p style={{ whiteSpace: 'pre-line', color: '#00ff88', marginTop: '0.5rem' }}>
                      <p dangerouslySetInnerHTML={{ __html: response.forecast }} />
                    </p>

                    {response.structured?.length > 0 && (
                      <div style={{ marginTop: '2rem', height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={response.structured.map((item) => ({
                              name: item.metric,
                              Latest: item.latest,
                              Predicted: item.predicted,
                            }))}
                            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="Latest" stroke="#8884d8" strokeWidth={3} />
                            <Line type="monotone" dataKey="Predicted" stroke="#82ca9d" strokeWidth={3} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </Tile>
                )}
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Column>

      <Column sm={4} md={8} lg={16}>
        <ChatBox />
      </Column>
    </Grid>
  );
}
