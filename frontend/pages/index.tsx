'use client';

import { useState, useEffect } from 'react';
import {
  Grid,
  Column,
  Heading,
  Tabs,
  Tab,
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
  TrashCan,
} from "@carbon/icons-react";
import ForecastTab from '../components/ForecastTab';
import { API_BASE_URL } from '../constants/app.const';
import HistoryTab from '../components/HistoryTab';
import { Metrics } from '../types/metrics';
import AnalyzeSection from '../components/AnalyzeSection';

export default function Home() {
  const [metrics, setMetrics] = useState<Metrics>({
    co2_emissions: 0,
    waste_level: 0,
    energy_usage: 0,
  });
  const [miniChartData, setMiniChartData] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // --- LIVE DATA STREAM (SSE) ---
  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE_URL}/stream`);
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

              <AnalyzeSection metrics={metrics} />
            </TabPanel>

            {/* --- HISTORY TAB --- */}
            <TabPanel id="history">
              <HistoryTab activeTab={activeTab} metrics={metrics} />
            </TabPanel>

            {/* --- FORECAST TAB --- */}
            <TabPanel id="forecast">
              <ForecastTab />
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
