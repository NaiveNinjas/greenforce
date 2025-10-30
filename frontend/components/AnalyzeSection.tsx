'use client';

import { useState } from 'react';
import {
    Button,
    SkeletonPlaceholder,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
} from '@carbon/react';
import { API_BASE_URL } from '../constants/app.const';
import { Metrics } from '../types/metrics';
import { Play } from '@carbon/icons-react';

type Props = {
    metrics: Metrics;
};

export default function AnalyzeSection({ metrics }: Props) {
    const [isLoading, setIsLoading] = useState(-1)
    const [activeTab, setActiveTab] = useState(0);
    const [aiResponse, setAiResponse] = useState<any>(null);
    const [triggeredWorkflows, setTriggeredWorkflows] = useState<any>(null);

    // --- ANALYZE WORKFLOWS ---
    const analyze = async () => {
        try {
            setIsLoading(1)
            const res = await fetch(`${API_BASE_URL}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(metrics),
            });
            const result = await res.json();
            console.log(result)
            setAiResponse(result.ai_analysis);
            setTriggeredWorkflows(result.triggered);
        } catch (e) {
            console.error('Analyze error', e);
        }
        setIsLoading(0)
    };

    return (
        <>
            <Button onClick={analyze} renderIcon={Play} kind="primary" size="lg" style={{ marginTop: '2rem' }}>
                Analyze & Trigger Workflows
            </Button>
            <div style={{ marginTop: '1rem' }}>
                {isLoading == 1 && (
                    <SkeletonPlaceholder style={{ width: '100%' }} />
                )}

                {!isLoading && (
                    <Tabs selectedIndex={activeTab} onChange={(data) => setActiveTab(data.selectedIndex)}>
                        <TabList scrollDebounceWait={200}>
                            <Tab>AI Analysis</Tab>
                            <Tab>Triggered Workflows</Tab>
                        </TabList>

                        <TabPanels>
                            <TabPanel id="ai_analysis">
                                {aiResponse && (
                                    <p dangerouslySetInnerHTML={{ __html: aiResponse }} />
                                )}
                            </TabPanel>

                            <TabPanel id="triggered_workflows">
                                {triggeredWorkflows && triggeredWorkflows.length > 0 ? (
                                    <ul>
                                        {triggeredWorkflows.map((wf) => (
                                            <li key={wf.workflow}>✅ {wf.workflow}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No workflows were triggered</p>
                                )}
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                )}
            </div>
        </>
    )
}