"use client";

import React from "react";
import {
    DataTable,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell,
    Tile,
    Tag,
    ProgressBar,
    Button,
} from "@carbon/react";
import { ChartLine, Renew, Flash } from "@carbon/icons-react";

type Pattern = {
    timestamp: string;
    co2_emissions: number;
    waste_level: number;
    energy_usage: number;
    score: number;
};

type SimilarPatternsProps = {
    data?: Pattern[];
    loading?: boolean;
};

export default function SimilarPatterns({
    data = [],
    loading = false,
}: SimilarPatternsProps) {
    const headers = [
        { key: "timestamp", header: "Timestamp" },
        { key: "co2_emissions", header: "CO₂ (tons)" },
        { key: "waste_level", header: "Waste (%)" },
        { key: "energy_usage", header: "Energy (kWh)" },
        { key: "score", header: "Similarity Score" },
    ];

    const rows = data.map((item, idx) => ({
        id: `${idx}`,
        timestamp: new Date(item.timestamp).toLocaleTimeString(),
        co2_emissions: item.co2_emissions.toFixed(2),
        waste_level: item.waste_level.toFixed(2),
        energy_usage: item.energy_usage.toFixed(2),
        score: item.score.toFixed(2),
    }));

    return (
        <Tile
            style={{
                padding: "1.5rem",
                borderRadius: "1rem",
                background: "var(--cds-layer)",
            }}
        >
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <h4 style={{ margin: 0, fontWeight: 600 }}>
                        <ChartLine size={24} /> Similar Sustainability Patterns
                    </h4>
                </div>
                <Tag type="green" title="Patterns matched">
                    {data.length} found
                </Tag>
            </div>

            <DataTable rows={rows} headers={headers} isSortable>
                {({
                    rows,
                    headers,
                    getHeaderProps,
                    getTableProps,
                    getRowProps,
                }: any) => (
                    <TableContainer>
                        <Table {...getTableProps()} size="sm">
                            <TableHead>
                                <TableRow>
                                    {headers.map((header) => (
                                        <TableHeader
                                            key={header.key}
                                            {...getHeaderProps({ header })}
                                        >
                                            {header.header}
                                        </TableHeader>
                                    ))}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {rows.map((row: any) => (
                                    <TableRow key={row.id} {...getRowProps({ row })}>
                                        {row.cells.map((cell: any) => (
                                            <TableCell key={cell.id}>
                                                {cell.info.header === "score" ? (
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 8,
                                                        }}
                                                    >
                                                        <ProgressBar
                                                            hideLabel
                                                            max={2000}
                                                            value={parseFloat(cell.value)}
                                                            size="small" label={""} />
                                                        <span style={{ minWidth: 60 }}>
                                                            {parseFloat(cell.value).toFixed(1)}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    cell.value
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DataTable>

            <div className="flex justify-end mt-4 gap-2" style={{ paddingTop: '1rem' }}>
                <Button
                    kind="secondary"
                    size="sm"
                    renderIcon={Renew}
                    onClick={() => window.location.reload()}
                >
                    Refresh
                </Button>
                <Button
                    kind="primary"
                    size="sm"
                    renderIcon={Flash}
                    onClick={() => console.log("Analyze trends")}
                >
                    Analyze Trends
                </Button>
            </div>
        </Tile>
    );
}
