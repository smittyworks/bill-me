'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

type Step = 'upload' | 'review';

interface ExtractedData {
  balance: number;
  minimum_due: number;
  due_date: string;
  description: string;
  confidence: 'high' | 'medium' | 'low';
}

const confidenceColor: Record<string, string> = {
  high: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  low: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function NewBillPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('upload');
  const [preview, setPreview] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);


  // Editable fields
  const [description, setDescription] = useState('');
  const [balance, setBalance] = useState('');
  const [minimumDue, setMinimumDue] = useState('');
  const [dueDate, setDueDate] = useState('');

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
    setExtracting(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/bills/extract', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Extraction failed');
      }

      const data = await res.json();
      const ext: ExtractedData = data.extracted;

      setExtracted(ext);
      setDescription(ext.description || '');
      setBalance(String(ext.balance));
      setMinimumDue(String(ext.minimum_due));
      setDueDate(ext.due_date);
      setStep('review');
    } catch (err: any) {
      toast.error(err.message || 'Failed to read bill — please fill in details manually');
      setExtracted(null);
      setDescription('');
      setBalance('');
      setMinimumDue('');
      setDueDate('');
      setStep('review');
    } finally {
      setExtracting(false);
    }
  }

  async function handleSave() {
    if (!balance || !dueDate) {
      toast.error('Balance and due date are required');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          balance: parseFloat(balance),
          minimum_due: parseFloat(minimumDue || balance),
          due_date: dueDate,
          description,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to save bill');
      }

      toast.success('Bill saved!');
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save bill');
    } finally {
      setSaving(false);
    }
  }

  if (extracting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Reading your bill with AI...</p>
        {preview && (
          <img src={preview} alt="Bill preview" className="max-h-48 rounded-lg shadow object-contain" />
        )}
      </div>
    );
  }

  if (step === 'upload') {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Add a Bill</h1>
          <p className="text-muted-foreground mt-1">Take a photo or upload an image and we'll read it for you.</p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            {/* Camera capture (shows native camera on mobile browsers) */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <Button
              className="w-full h-14 text-base"
              onClick={() => cameraInputRef.current?.click()}
            >
              <Camera className="w-5 h-5 mr-2" />
              Take a Photo
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            {/* File picker */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <Button
              variant="outline"
              className="w-full h-14 text-base"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload from Device
            </Button>
          </CardContent>
        </Card>

        <Button variant="ghost" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Cancel
          </Link>
        </Button>
      </div>
    );
  }

  // Review step
  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setStep('upload')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Review Details</h1>
          <p className="text-muted-foreground text-sm">Check and correct any mistakes before saving.</p>
        </div>
      </div>

      {/* Image thumbnail */}
      {preview && (
        <img src={preview} alt="Bill" className="w-full max-h-48 object-contain rounded-lg border border-border shadow-sm" />
      )}

      {/* Confidence badge */}
      {extracted && (
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm text-muted-foreground">AI extraction confidence:</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${confidenceColor[extracted.confidence]}`}>
            {extracted.confidence}
          </span>
        </div>
      )}

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g. Electric Bill"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="balance">Total Balance ($)</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="minimum">Minimum Due ($)</Label>
              <Input
                id="minimum"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={minimumDue}
                onChange={(e) => setMinimumDue(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="due_date">Due Date</Label>
            <Input
              id="due_date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep('upload')} className="flex-1">
          Retake
        </Button>
        <Button onClick={handleSave} disabled={saving} className="flex-1">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Save Bill
        </Button>
      </div>
    </div>
  );
}
