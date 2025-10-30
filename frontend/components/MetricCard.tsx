import { Tile, Heading } from "@carbon/react";
import { ReactNode } from "react";

type Props = {
  name: string;
  value: number;
  icon: ReactNode;
};

export default function MetricCard({ name, value, icon }: Props) {
  return (
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
        <Heading style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>
          {name}
        </Heading>
        <Heading style={{ fontSize: "1.5rem", fontWeight: 600 }}>
          {value}
        </Heading>
      </div>
    </Tile>
  );
}
