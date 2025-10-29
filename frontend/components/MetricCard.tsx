import { Tile, Heading } from '@carbon/react';

type Props = {
  name: string;
  value: number;
};

export default function MetricCard({ name, value }: Props) {
  return (
    <Tile style={{ width: '250px', textAlign: 'center', padding: '1rem' }}>
      <Heading>{name}</Heading>
      <Heading>{value}</Heading>
    </Tile>
  );
}
