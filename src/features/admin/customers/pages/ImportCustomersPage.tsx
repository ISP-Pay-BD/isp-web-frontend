'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { saveBlob } from '@/lib/api/client';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useImportCustomers } from '../hooks/use-customers';
import type { ImportResult } from '../types';

/** Exact header row the backend importer validates (CustomerService::importExcel). */
const IMPORT_HEADERS = [
  'ID',
  'Customer Name',
  'Mobile',
  'PackageName',
  'Router name',
  'Email',
  'PPPoE Secret',
  'PPPoE Password',
  'Subscription. Status',
  'Acc. Status',
  'Area',
  'Address',
  'Bandwidth',
  'WillExpire(m/d/y)',
];

const ACCEPT = '.xlsx,.xls,.csv';
const MAX_BYTES = 10 * 1024 * 1024;

export function ImportCustomersPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const importMutation = useImportCustomers();

  const pick = (f: File | undefined) => {
    setResult(null);
    setFileError(null);
    if (!f) return;
    if (f.size > MAX_BYTES) {
      setFileError('The file is larger than 10 MB.');
      return;
    }
    setFile(f);
  };

  const handleImport = () => {
    if (!file) return;
    setProgress(0);
    importMutation.mutate(
      { file, onProgress: setProgress },
      {
        onSuccess: (res) => {
          setResult(res);
          setFile(null);
          if (inputRef.current) inputRef.current.value = '';
        },
      },
    );
  };

  const downloadTemplate = () => {
    saveBlob(new Blob([`${IMPORT_HEADERS.join(',')}\n`], { type: 'text/csv;charset=utf-8' }), 'customer_import_template.csv');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHero className="flex items-center gap-3">
        <Link href="/admin/customers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Import Customers via Excel</h1>
          <p className="text-muted-foreground text-sm">
            Batch provision subscriber accounts from a spreadsheet (.xlsx / .xls / .csv).
          </p>
        </div>
      </PageHero>
      <PageContent className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upload Spreadsheet File</CardTitle>
            <CardDescription>
              The first row must be exactly the template header. Each row creates the PPPoE secret on the named router
              (if missing) and the customer record; package, router and area are matched by name.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => pick(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                pick(e.dataTransfer.files?.[0]);
              }}
              className={`w-full border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                file ? 'border-emerald-500 bg-emerald-500/5' : 'border-muted-foreground/30 hover:border-primary/50'
              }`}
            >
              {file ? (
                <div className="flex flex-col items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <FileSpreadsheet className="h-10 w-10" />
                  <div className="font-semibold text-sm">{file.name}</div>
                  <div className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB · ready to import</div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <UploadCloud className="h-10 w-10 text-muted-foreground" />
                  <div className="font-medium text-sm">Click to select or drag and drop file here</div>
                  <div className="text-xs text-muted-foreground">Supports .XLSX, .XLS, .CSV up to 10MB</div>
                </div>
              )}
            </button>
            {fileError && <p className="text-xs text-destructive">{fileError}</p>}

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>Required columns: Customer Name, Mobile, PackageName, Router name</span>
              <Button variant="link" size="sm" className="text-xs h-auto p-0" onClick={downloadTemplate}>
                Download Template (CSV)
              </Button>
            </div>

            {importMutation.isPending && <Progress value={progress} />}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                disabled={!file || importMutation.isPending}
                onClick={() => {
                  setFile(null);
                  if (inputRef.current) inputRef.current.value = '';
                }}
              >
                Clear
              </Button>
              <Button onClick={handleImport} disabled={!file || importMutation.isPending} className="bg-primary hover:bg-primary/90">
                {importMutation.isPending ? `Importing… ${progress}%` : 'Import Customers'}
              </Button>
            </div>
            {importMutation.isError && (
              <p className="text-xs text-destructive">{errorMessage(importMutation.error)}</p>
            )}
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                {result.errorCount === 0 ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                )}
                Import Result
              </CardTitle>
              <CardDescription>
                {result.rowCount} rows read · {result.createdCount} created · {result.errorCount} failed · {result.warningCount} warnings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.errors.length + result.warnings.length > 0 ? (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">Row</TableHead>
                        <TableHead className="w-24">Type</TableHead>
                        <TableHead>Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.errors.map((e, i) => (
                        <TableRow key={`e${i}`}>
                          <TableCell className="font-mono text-xs">{e.row}</TableCell>
                          <TableCell className="text-xs text-destructive">Error</TableCell>
                          <TableCell className="text-xs">{e.message}</TableCell>
                        </TableRow>
                      ))}
                      {result.warnings.map((w, i) => (
                        <TableRow key={`w${i}`}>
                          <TableCell className="font-mono text-xs">{w.row}</TableCell>
                          <TableCell className="text-xs text-amber-500">Warning</TableCell>
                          <TableCell className="text-xs">{w.message}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Every row was imported without issues.</p>
              )}
              <div className="flex justify-end">
                <Link href="/admin/customers">
                  <Button variant="outline">Back to customers</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </PageContent>
    </div>
  );
}
