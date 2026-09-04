'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UploadCloud, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

const SAMPLE_PREVIEW = [
  { name: 'Tanvir Hossain', username: 'tanvir_mirpur', phone: '01719998877', pkg: 'Home 10 Mbps', area: 'Mirpur 10' },
  { name: 'Shakil Ahmed', username: 'shakil_uttara', phone: '01719998878', pkg: 'Home 20 Mbps', area: 'Uttara Sector 7' },
  { name: 'Nusrat Jahan', username: 'nusrat_dhan', phone: '01719998879', pkg: 'Home 15 Mbps', area: 'Dhanmondi Road 27' },
];

export function ImportCustomersPage() {
  const router = useRouter();
  const [fileUploaded, setFileUploaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImport = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast.success('Successfully imported 3 customers from Excel file');
      router.push('/admin/customers');
    }, 1200);
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
            Batch provision subscriber accounts from spreadsheet (.xlsx / .csv).
          </p>
        </div>
      </PageHero>
      <PageContent className="space-y-6">

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload Spreadsheet File</CardTitle>
          <CardDescription>
            Download the template, fill in customer name, mobile, package, and area, then drag & drop below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onClick={() => setFileUploaded(true)}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              fileUploaded
                ? 'border-emerald-500 bg-emerald-500/5'
                : 'border-muted-foreground/30 hover:border-primary/50'
            }`}
          >
            {fileUploaded ? (
              <div className="flex flex-col items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <FileSpreadsheet className="h-10 w-10" />
                <div className="font-semibold text-sm">customers_batch_september.xlsx</div>
                <div className="text-xs text-muted-foreground">3 valid records ready for preview</div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <UploadCloud className="h-10 w-10 text-muted-foreground" />
                <div className="font-medium text-sm">Click to select or drag and drop file here</div>
                <div className="text-xs text-muted-foreground">Supports .XLSX, .XLS, .CSV up to 10MB</div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Required headers: Name, Username, Phone, Package, Area</span>
            <Button
              variant="link"
              size="sm"
              className="text-xs h-auto p-0"
              onClick={() => toast.info('Sample template downloaded')}
            >
              Download Sample Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {fileUploaded && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview Records</CardTitle>
            <CardDescription>Confirm mapped columns before final database insertion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Area</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SAMPLE_PREVIEW.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="font-mono text-xs">{row.username}</TableCell>
                      <TableCell className="font-mono text-xs">{row.phone}</TableCell>
                      <TableCell>{row.pkg}</TableCell>
                      <TableCell>{row.area}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setFileUploaded(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={isProcessing}
                className="bg-primary hover:bg-primary/90"
              >
                {isProcessing ? 'Importing…' : 'Proceed & Import Customers'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    
      </PageContent>
    </div>
  );
}
