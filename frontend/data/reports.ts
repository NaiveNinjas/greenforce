// /data/reports.ts
export const reports = [
  {
    id: '1', // ← use string, not number
    name: 'Carbon Emissions Report',
    type: 'Carbon Footprint',
    date: '2025-09-30',
    status: 'Compliant',
    summary: 'Carbon emissions reduced by 7% compared to last quarter.',
    file: '/dummy-reports/carbon-q3.pdf',
  },
  {
    id: '2',
    name: 'Energy Efficiency Audit',
    type: 'Energy',
    date: '2025-10-10',
    status: 'Action Required',
    summary:
      'Energy consumption exceeded 5% threshold at Mumbai plant. Immediate corrective measures advised.',
    file: '/dummy-reports/energy-audit.csv',
  },
  {
    id: '3',
    name: 'Waste Management Review',
    type: 'Waste',
    date: '2025-08-20',
    status: 'Compliant',
    summary: 'Recycling rate improved to 85% across facilities.',
    file: '/dummy-reports/waste-review.pdf',
  },
];
