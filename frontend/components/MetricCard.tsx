import { Tile, Heading } from '@carbon/react';
import { ReactNode } from 'react';

type Props = {
  name: string;
  value: number;
  icon: ReactNode;
};

export default function MetricCard({ name, value, icon }: Props) {
  return (

    <Tile
      style={{
        width: '300px',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center', // vertically center icon + text
        gap: '1rem',
      }}
    >
      {/* Left column — large icon */}
      <div
        style={{
          flexShrink: 0,
          fontSize: '3rem', // make the icon big
          color: '#0f62fe', // optional: IBM Carbon blue
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>

      {/* Right column — name + value */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Heading style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{name}</Heading>
        <Heading style={{ fontSize: '1.5rem', fontWeight: 600 }}>{value}</Heading>
      </div>
    </Tile>
  );
}
