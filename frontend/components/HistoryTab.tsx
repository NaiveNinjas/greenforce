'use client';

import { useState, useEffect } from 'react';
import {
    Button,
    Heading,
    Tile,
} from '@carbon/react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { API_BASE_URL } from '../constants/app.const';
import { Metrics } from '../types/metrics';
import SimilarPatterns from './SimilarPatterns';

type Props = {
    activeTab: number;
    metrics: Metrics;
};

export default function HistoryTab({ activeTab, metrics }: Props) {

    const [history, setHistory] = useState<any[]>([]);
    const [similar, setSimilar] = useState<any[]>([]);

    // --- FETCH HISTORY ---
    const fetchHistory = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/history`);
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
            const res = await fetch(`${API_BASE_URL}/similar`, {
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

    const patterns = [
        {
            timestamp: "2025-11-01T11:40:32.380681",
            co2_emissions: 91.95,
            waste_level: 82.77,
            energy_usage: 12680.22,
            score: 43.5035,
        },
        {
            timestamp: "2025-11-01T11:40:37.381806",
            co2_emissions: 117.76,
            waste_level: 64.34,
            energy_usage: 13603.48,
            score: 960.0049,
        },
        {
            timestamp: "2025-11-01T11:40:57.382108",
            co2_emissions: 117.18,
            waste_level: 67.71,
            energy_usage: 13812.58,
            score: 1169.0535,
        },
    ];

    return (
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

            <div style={{ padding: "2rem" }}>
                <SimilarPatterns data={patterns} />
            </div>
        </div>
    )
}