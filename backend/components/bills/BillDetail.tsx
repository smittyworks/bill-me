'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bill } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Pencil, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function daysUntilDue(dueDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function BillDetail({ bill: initialBill }: { bill: Bill }) {
  const router = useRouter();
  const [bill, setBill] = useState(initialBill);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit state
  const [description, setDescription] = useState(bill.description ?? '');
  const [balance, setBalance] = useState(String(bill.balance));
  const [minimumDue, setMinimumDue] = useState(String(bill.minimum_due));
  const [dueDate, setDueDate] = useState(new Date(bill.due_date).toISOString().split('T')[0]);

  const isPaid = bill.status === 'paid';
  const days = daysUntilDue(bill.due_date);
  const isOverdue = !isPaid && days < 0;

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/bills/${bill.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          balance: parseFloat(balance),
          minimum_due: parseFloat(minimumDue),
          due_date: dueDate,
        }),
      });
      if (!res.ok) throw new Error('Failed to update bill');
      const updated: Bill = await res.json();
      setBill(updated);
      setEditing(false);
      toast.success('Bill updated');
    } catch {
      toast.error('Failed to update bill');
    } finally {
      setSaving(false);
    }
  }

  async function handleMarkPaid() {
    setSaving(true);
    try {
      const res = await fetch(`/api/bills/${bill.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: isPaid ? 'unpaid' : 'paid' }),
      });
      if (!res.ok) throw new Error('Failed to update');
      const updated: Bill = await res.json();
      setBill(updated);
      toast.success(isPaid ? 'Marked as unpaid' : 'Marked as paid!');
    } catch {
      toast.error('Failed to update bill');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/bills/${bill.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Bill deleted');
      router.push('/dashboard');
      router.refresh();
    } catch {
      toast.error('Failed to delete bill');
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Back nav */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Link>
        </Button>
        <div className="flex gap-2">
          {!editing && (
            <Button variant="outline" size="icon" onClick={() => setEditing(true)}>
              <Pencil className="w-4 h-4" />
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this bill?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{bill.description || 'this bill'}". This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Bill image */}
      {bill.image_url && (
        <img
          src={bill.image_url}
          alt="Bill"
          className="w-full max-h-56 object-contain rounded-lg border border-border shadow-sm"
        />
      )}

      {/* Status + urgency */}
      <div className="flex items-center gap-3">
        <Badge variant={isPaid ? 'secondary' : isOverdue ? 'destructive' : 'outline'} className="text-sm">
          {isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Unpaid'}
        </Badge>
        {!isPaid && (
          <span className={`text-sm ${isOverdue ? 'text-destructive' : days <= 5 ? 'text-yellow-600 dark:text-yellow-400' : 'text-muted-foreground'}`}>
            {isOverdue
              ? `${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} overdue`
              : days === 0
              ? 'Due today'
              : `${days} day${days !== 1 ? 's' : ''} until due`}
          </span>
        )}
      </div>

      {/* Detail card — view or edit mode */}
      <Card>
        <CardHeader>
          <CardTitle>{editing ? 'Edit Bill' : (bill.description || 'Bill')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="desc">Description</Label>
                <Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="balance">Balance ($)</Label>
                  <Input id="balance" type="number" step="0.01" value={balance} onChange={(e) => setBalance(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="min">Minimum Due ($)</Label>
                  <Input id="min" type="number" step="0.01" value={minimumDue} onChange={(e) => setMinimumDue(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="date">Due Date</Label>
                <Input id="date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setEditing(false)} className="flex-1">Cancel</Button>
                <Button onClick={handleSave} disabled={saving} className="flex-1">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Changes
                </Button>
              </div>
            </>
          ) : (
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-muted-foreground text-sm">Total Balance</dt>
                <dd className="font-semibold text-lg">${Number(bill.balance).toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground text-sm">Minimum Due</dt>
                <dd className="font-medium">${Number(bill.minimum_due).toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground text-sm">Due Date</dt>
                <dd className="font-medium">{formatDate(bill.due_date)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground text-sm">Added</dt>
                <dd className="text-sm text-muted-foreground">
                  {new Date(bill.created_at).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          )}
        </CardContent>
      </Card>

      {/* Mark paid / unpaid */}
      {!editing && (
        <Button
          onClick={handleMarkPaid}
          disabled={saving}
          variant={isPaid ? 'outline' : 'default'}
          className="w-full"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4 mr-2" />
          )}
          {isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
        </Button>
      )}
    </div>
  );
}
