'use client';

import { useState } from 'react';
import {
  Grid,
  Column,
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
import { reports } from '../data/reports';
import Image from "next/image";

const headers = [
  { key: 'name', header: 'Report Name' },
  { key: 'type', header: 'Type' },
  { key: 'date', header: 'Date' },
  { key: 'status', header: 'Status' },
];

export default function ComplianceReportsPage() {
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
    <Grid fullWidth style={{ marginTop: '2rem' }}>
      <Column sm={4} md={8} lg={16}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex' }} className="flex items-center space-x-3">
            <Image
              src="/logo.png"
              alt="GreenForce Logo"
              width={55}
              height={55}
              priority
            />
            <Heading style={{ paddingLeft: '0.5rem' }}> GreenForce Sustainability Assistant</Heading>
          </div>
            
        </div>
      </Column>

      <Column sm={4} md={8} lg={16}>
      <Heading style={{ marginBottom: '1rem', fontSize: '2rem' }}>
  📋  Compliance Reports
      </Heading>      
      <p style={{ color: '#6f6f6f', marginBottom: '2rem' }}>
        View, inspect, and download sustainability compliance reports.
      </p>

      <Tile style={{ padding: '1.5rem' }}>
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
              color: selectedReport?.status === 'Compliant' ? 'green' : 'red',
            }}
          >
            {selectedReport?.status}
          </span>
        </p>
        <p style={{ marginTop: '1rem' }}>{selectedReport?.summary}</p>
      </Modal>
      </Column>
    </Grid>
  );
}
