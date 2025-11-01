'use client';

import { useState } from 'react';
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableToolbar,
  TableToolbarContent,
  Button,
  Modal,
  Tile,
  Heading,
} from '@carbon/react';
import { Download, View } from '@carbon/icons-react';
import { reports } from '../data/reports'; // <-- imported from data folder

const headers = [
  { key: 'name', header: 'Report Name' },
  { key: 'type', header: 'Type' },
  { key: 'date', header: 'Date' },
  { key: 'status', header: 'Status' },
];

export default function ComplianceReportsTab() {
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (report: any) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <Tile style={{ marginTop: '1rem', padding: '1rem' }}>
        <Heading>📋 Compliance Reports</Heading>
        <p style={{ color: '#6f6f6f', marginBottom: '1rem' }}>
          View and download sustainability compliance reports.
        </p>

        <DataTable
          rows={reports}
          headers={headers}
          render={({ rows, headers, getHeaderProps }) => (
            <TableContainer>

              <Table size="md">
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader key={header.key} {...getHeaderProps({ header })}>
                        {header.header}
                      </TableHeader>
                    ))}
                    <TableHeader>Actions</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => {
                    const report = reports.find((r) => r.id === row.id);
                    return (
                      <TableRow key={row.id}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ))}
                        <TableCell>
                          <Button
                            hasIconOnly
                            kind="ghost"
                            size="sm"
                            renderIcon={View}
                            iconDescription="View report"
                            onClick={() => openModal(report)}
                          />
                          <a href={report?.file} download>
                            <Button
                            hasIconOnly
                            kind="ghost"
                            size="sm"
                            renderIcon={Download}
                            iconDescription="Download report"
                            />
                          </a>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        />
      </Tile>

      {/* Modal for Report Details */}
      <Modal
        open={isModalOpen}
        onRequestClose={closeModal}
        modalHeading={selectedReport?.name}
        primaryButtonText="Download Report"
        secondaryButtonText="Close"
        onRequestSubmit={() => {
          const link = document.createElement('a');
          link.href = selectedReport.file;
          link.download = selectedReport.name + '.pdf';
          link.click();
          closeModal();
        }}
      >
        <p>
          <strong>Type:</strong> {selectedReport?.type}
        </p>
        <p>
          <strong>Date:</strong> {selectedReport?.date}
        </p>
        <p>
          <strong>Status:</strong>{' '}
          <span
            style={{
              color:
                selectedReport?.status === 'Compliant' ? 'green' : 'red',
            }}
          >
            {selectedReport?.status}
          </span>
        </p>
        <p style={{ marginTop: '1rem' }}>{selectedReport?.summary}</p>
      </Modal>
    </div>
  );
}
