"use client";

import { Bill } from "@shared/types";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

function daysUntilDue(dueDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function BillCard({ bill }: { bill: Bill }) {
  const days = daysUntilDue(bill.due_date);
  const isPaid = bill.status === "paid";
  const isOverdue = !isPaid && days < 0;
  const isUrgent = !isPaid && days >= 0 && days <= 5;

  return (
    <Link href={`/bills/${bill.id}`}>
      <Card
        className={`my-2 py-3 gap-1 hover:shadow-md transition-shadow cursor-pointer ${isOverdue ? "border-destructive/50" : isUrgent ? "border-yellow-400/60" : ""}`}
      >
        <CardTitle className="mx-4 p-0 truncate">
          {bill.description || "Bill"}
        </CardTitle>
        <CardContent className="py-2 space-y-1">
          {/* Full-width date + days left */}
          <p className={`text-sm ${isOverdue && !isPaid ? "text-destructive" : isUrgent ? "text-yellow-600 dark:text-yellow-400" : "text-muted-foreground"}`}>
            {isPaid
              ? `Due ${formatDate(bill.due_date)}`
              : days === 0
                ? "Due today"
                : `Due ${formatDate(bill.due_date)} (${isOverdue ? `${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} overdue` : `${days} day${days !== 1 ? "s" : ""}`})`}
          </p>

          {/* Bottom row: icon + amount + badge */}
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              {isPaid ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : isOverdue ? (
                <AlertTriangle className="w-5 h-5 text-destructive" />
              ) : (
                <Clock
                  className={`w-5 h-5 ${isUrgent ? "text-yellow-500" : "text-muted-foreground"}`}
                />
              )}
            </div>

            {bill.minimum_due && Number(bill.minimum_due) > 0 && (
              <p className="font-semibold text-xl">
                ${Number(bill.minimum_due).toFixed(2)}
              </p>
            )}

            <div className="flex-1" />

            <Badge
              variant={
                isPaid ? "secondary" : isOverdue ? "destructive" : "outline"
              }
            >
              {isPaid ? "Paid" : isOverdue ? "Overdue" : "Unpaid"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
