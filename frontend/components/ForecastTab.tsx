'use client';

import { useState, useEffect } from 'react';
import {
    Button,
    Heading,
    Tile,
} from '@carbon/react';
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
    Renew
} from "@carbon/icons-react";
import { API_BASE_URL } from '../constants/app.const';

function ForecastHeader({ fetchForecast }: { fetchForecast: () => void }) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
            }}
        >
            <Heading>
                📈 Sustainability Forecast (7 Days)
            </Heading>

            <Button
                kind="ghost"
                hasIconOnly
                size="lg"
                renderIcon={Renew}
                iconDescription="Reload forecast"
                onClick={fetchForecast}
            />
        </div>
    );
}

export default function ForecastTab() {
    const [forecastResponse, setForecastResponse] = useState<any>(null);

    // --- FORECAST TAB (Watsonx.ai) ---
    const fetchForecast = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/forecast`);
            const data = await res.json();
            setForecastResponse({ forecast: data.forecast, structured: data.structured });
        } catch (e) {
            setForecastResponse({ forecast: 'Unable to fetch forecast.', structured: [] });
        }
    };

    useEffect(() => {
        fetchForecast();
        const interval = setInterval(fetchForecast, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ marginTop: '1rem' }}>
            {forecastResponse?.forecast && (
                <Tile style={{ marginTop: '2rem', padding: '1rem' }}>
                    <ForecastHeader fetchForecast={fetchForecast} />
                    {forecastResponse.structured?.length > 0 && (
                        <div style={{ marginTop: '2rem', height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={forecastResponse.structured.map((item) => ({
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
                    <p style={{ whiteSpace: 'pre-line', color: '#00ff88', marginTop: '0.5rem' }}>
                        <p dangerouslySetInnerHTML={{ __html: forecastResponse.forecast }} />
                    </p>
                </Tile>
            )}
        </div>
    )
}