"use client";

import { Bill } from "@shared/types";
import { Card, CardContent } from "@/components/ui/card";
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
        className={`my-4 hover:shadow-md transition-shadow cursor-pointer ${isOverdue ? "border-destructive/50" : isUrgent ? "border-yellow-400/60" : ""}`}
      >
        <CardContent className="flex items-center gap-4 py-4">
          {/* Status icon */}
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

          {/* Description + due date */}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{bill.description || "Bill"}</p>
            <p className="text-sm text-muted-foreground">
              Due {formatDate(bill.due_date)}
              {!isPaid && (
                <span
                  className={`ml-2 ${isOverdue ? "text-destructive" : isUrgent ? "text-yellow-600 dark:text-yellow-400" : ""}`}
                >
                  {isOverdue
                    ? `${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} overdue`
                    : days === 0
                      ? "due today"
                      : `${days} day${days !== 1 ? "s" : ""} left`}
                </span>
              )}
            </p>
          </div>

          {/* Amounts */}
          <div className="text-right shrink-0">
            <p className="font-semibold">${Number(bill.balance).toFixed(2)}</p>
            {bill.minimum_due && Number(bill.minimum_due) > 0 && (
              <p className="text-xs text-muted-foreground">
                min ${Number(bill.minimum_due).toFixed(2)}
              </p>
            )}
          </div>

          {/* Status badge */}
          <Badge
            variant={
              isPaid ? "secondary" : isOverdue ? "destructive" : "outline"
            }
          >
            {isPaid ? "Paid" : isOverdue ? "Overdue" : "Unpaid"}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
