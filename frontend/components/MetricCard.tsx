'use client';
import { Tile, Heading } from '@carbon/react';
// import { motion } from 'framer-motion';
import { ReactNode } from 'react';

type Props = {
  name: string;
  value: number;
  icon: ReactNode;
};

const thresholds = {
  "CO₂ Emissions (tons)": { low: 100, medium: 130, high: 150, title: '#2B7AE4' },
  "Waste Level (%)": { low: 30, medium: 40, high: 50, title: '#7B61FF' },
  "Energy Usage (kWh)": { low: 10000, medium: 15000, high: 17000, title: '#00B3A6' },
};

const getColor = (name, value) => {
  const { medium, high } = thresholds[name];
  if (value >= high) return '#ff3e54';
  if (value >= medium) return '#ffe066';
  return '#00ff88';
};

const getTitleColor = (name) => {
  const { title } = thresholds[name];
  return title
};

export default function MetricCard({ name, value, icon }: Props) {
  return (
    // <motion.div
    //   initial={{ opacity: 0.8 }}
    //   animate={{
    //     opacity: [0.8, 1, 0.8],
    //     boxShadow: [
    //       '0 0 0px rgba(0,255,100,0)',
    //       '0 0 5px rgba(0,100,220,0.6)',
    //       '0 0 0px rgba(0,255,100,0)',
    //     ],
    //   }}
    //   transition={{ duration: 3, repeat: Infinity }}
    // >
    <Tile
      style={{
        width: "300px",
        padding: "1rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          fontSize: "3rem",
          color: "#0f62fe",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Heading style={{ color: getTitleColor(name), fontSize: "1rem", marginBottom: "0.25rem" }}>
          {name}
        </Heading>
        <Heading style={{ color: getColor(name, value), fontSize: "1.5rem", fontWeight: 600 }}>
          {value}
        </Heading>
      </div>
    </Tile>
    // </motion.div>
  );
}
