'use client';

import { useState } from 'react';
import {
    Button,
    ContainedList,
    ContainedListItem,
    SkeletonPlaceholder,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Tag,
    Tile,
} from '@carbon/react';
import { API_BASE_URL } from '../constants/app.const';
import { Metrics } from '../types/metrics';
import { CheckmarkOutline, Play } from '@carbon/icons-react';

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
            setAiResponse({
                "recommended_workflows": [
                    {
                        "name": "carbon_audit",
                        "reason": "CO₂ emissions of 07 tons are significantly above the baseline, indicating a need for a detailed carbon footprint analysis to identify high-emission areas."
                    },
                    {
                        "name": "energy_optimization",
                        "reason": "Energy consumption of 52 kWh is notably high, signaling potential for efficiency enhancements and exploring renewable energy options."
                    },
                    {
                        "name": "waste_reduction",
                        "reason": "Waste generation at 58% suggests a substantial opportunity for improvement, particularly in recycling and waste diversion."
                    }
                ],
                "next_actions": [
                    "Conduct a comprehensive carbon audit to identify and quantify emission sources, prioritizing reductions in high-impact areas.",
                    "Develop and execute a waste reduction plan, including enhanced recycling programs, composting, and waste audits to minimize landfill contributions.",
                    "Implement an energy efficiency program, focusing on equipment upgrades, behavioral changes, and exploring renewable energy options to decrease reliance on non-renewable sources."
                ]
            });
            setTriggeredWorkflows({
                "recommended_workflows": [
                    {
                        "name": "carbon_audit",
                        "reason": "High CO₂ emissions"
                    },
                    {
                        "name": "energy_optimization",
                        "reason": "High energy consumption"
                    },
                    {
                        "name": "waste_reduction",
                        "reason": "High waste generation"
                    }
                ],
                "next_actions": [
                    "Perform a detailed carbon footprint analysis to pinpoint major emission sources.",
                    "Implement energy-saving measures such as LED lighting, smart thermostats, and equipment upgrades.",
                    "Establish a waste reduction program focusing on source reduction, recycling, and composting."
                ]
            });
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
                            {/* AI Analysis Panel */}
                            <TabPanel id="ai_analysis" className="mt-4">
                                {aiResponse && aiResponse.recommended_workflows?.length > 0 ? (
                                    <div>
                                        <ContainedList label="Based on current metrics, the following workflows are recommended:" kind="on-page">
                                            {aiResponse.recommended_workflows.map((wf) => (
                                                <ContainedListItem>
                                                    <Tile>
                                                        {wf.name}
                                                        <br />
                                                        <br />
                                                        {wf.reason}
                                                    </Tile>
                                                </ContainedListItem>
                                            ))}
                                        </ContainedList>

                                        <div className="mt-4">
                                            <ContainedList label="Recommended Next Actions" kind="on-page">
                                                {aiResponse.next_actions?.map((action, index) => (
                                                    <ContainedListItem>{action}</ContainedListItem>
                                                ))}
                                            </ContainedList>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-text-secondary">No AI analysis available.</p>
                                )}
                            </TabPanel>

                            {/* Triggered Workflows Panel */}
                            <TabPanel id="triggered_workflows" className="mt-4">
                                {triggeredWorkflows && triggeredWorkflows.recommended_workflows?.length > 0 ? (
                                    <div>
                                        <ContainedList label="" kind="on-page">
                                            {triggeredWorkflows.recommended_workflows.map((wf) => (
                                                <ContainedListItem renderIcon={CheckmarkOutline}><span>{wf.name}</span><Tag type="green" size="sm">
                                                    {wf.reason}
                                                </Tag></ContainedListItem>
                                            ))}
                                        </ContainedList>

                                        <div className="mt-4">
                                            <ContainedList label="Recommended Next Actions" kind="on-page">
                                                {triggeredWorkflows.next_actions?.map((action, index) => (
                                                    <ContainedListItem>{action}</ContainedListItem>
                                                ))}
                                            </ContainedList>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-text-secondary">No workflows were triggered.</p>
                                )}
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                )}
            </div>
        </>
    )
}