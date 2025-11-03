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
  TabPanel,
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
import Image from "next/image";

export default function Home() {
  const [metrics, setMetrics] = useState<Metrics>({
    co2_emissions: 0,
    waste_level: 0,
    energy_usage: 0,
  });
  const [miniChartData, setMiniChartData] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // --- anomaly state ---
  const [anomaly, setAnomaly] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

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

        // --- detect anomaly ---
        if (!anomaly && !processing) {
          setTimeout(() => handleAnomaly("CO₂ emissions exceed safe threshold"), 2000);
        }
      } catch (e) {
        console.error('Error parsing SSE data', e);
      }
    };

    eventSource.onerror = () => {
      setIsLive(false);
      eventSource.close();
    };

    return () => eventSource.close();
  }, [anomaly, processing]);

  // --- function to handle anomaly event ---
  const handleAnomaly = async (msg: string) => {
    setAnomaly(true);
    setAlertMessage(msg);
    setProcessing(true);

    // simulate workflow trigger delay
    await new Promise((r) => setTimeout(r, 2500));

    console.log("Triggering corrective action for anomaly...");
    setProcessing(false);
    // setTimeout(() => setAnomaly(false), 5000);
  };

  const onTabChange = (data) => {
    setActiveTab(data.selectedIndex)
    if (data.selectedIndex != 0) { setAnomaly(false) }
  }

  return (
    <Grid fullWidth style={{ marginTop: '2rem' }}>
      <Column sm={4} md={8} lg={16}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex' }} className="flex items-center space-x-3">
            <Image
              src="/logo.png"
              alt="GreenForce Logo"
              width={55}
              height={55}
              priority
            />
            <Heading style={{ paddingLeft: '0.5rem' }}> GreenForce Sustainability Assistant</Heading>
          </div>
          <span style={{ color: isLive ? 'limegreen' : 'gray', fontWeight: 600 }}>
            ● {isLive ? 'Live data streaming' : 'Offline'}
          </span>
        </div>
      </Column>

      <Column sm={4} md={8} lg={16}>
        <Tabs selectedIndex={activeTab} onChange={onTabChange}>
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

              <AnalyzeSection alertMessage={alertMessage} anomaly={anomaly} metrics={metrics} processing={processing} />
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

      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.6; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </Grid>
  );
}
