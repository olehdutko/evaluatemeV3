'use client';

import { useState } from 'react';
import { useAuth } from '../../lib/auth/auth-context';
import { PageHeader } from '../../components/ui/PageHeader';
import { ErrorMessage } from '../../components/ui/ErrorMessage';

const PRICE_PER_CREDIT_USD = 1;

export default function BuyCreditsPage(): JSX.Element {
  const { user, credits, isLoading: authLoading } = useAuth();
  const [quantity, setQuantity] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (authLoading || user?.role !== 'user') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PageHeader title="Buy credits" description="Credits purchase is only available for personal accounts." />
      </div>
    );
  }

  async function handlePurchase(): Promise<void> {
    setError(null);
    setSuccess(false);
    setIsProcessing(true);
    try {
      // Stub: replace with real payment/checkout flow later.
      await new Promise((resolve) => { setTimeout(resolve, 800); });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }

  const total = quantity * PRICE_PER_CREDIT_USD;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PageHeader
        title="Buy credits"
        description="Purchase credits to start tests and access premium features." />

      <div className="panel accent p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-body text-text-primary font-medium">Current balance</p>
            <p className="font-mono text-2xl text-accent">{credits} credits</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="font-body text-text-primary font-medium">Price</p>
            <p className="font-mono text-text-secondary">${PRICE_PER_CREDIT_USD} per credit</p>
          </div>
        </div>

        <div className="space-y-3">
          <label htmlFor="quantity" className="label-mono">Quantity</label>
          <div className="flex items-center gap-4">
            <input
              id="quantity"
              type="range"
              min={1}
              max={1000}
              value={quantity}
              onChange={(e) => { setQuantity(Number(e.target.value)); }}
              className="flex-1 accent-accent"
            />
            <input
              type="number"
              min={1}
              max={1000}
              value={quantity}
              onChange={(e) => { setQuantity(Math.max(1, Math.min(1000, Number(e.target.value) || 1))); }}
              className="input-field w-24 text-center"
            />
          </div>
          <p className="font-mono text-sm text-text-secondary">You will receive {quantity} credits.</p>
        </div>

        <div className="border-t border-border pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="font-display text-2xl font-bold text-text-primary">Total: ${total.toFixed(2)} USD</p>
            <button
              type="button"
              onClick={() => { void handlePurchase(); }}
              disabled={isProcessing}
              className="btn-primary text-base py-3 px-8 disabled:opacity-50"
            >
              {isProcessing ? 'Processing…' : 'Buy credits'}
            </button>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}
        {success && (
          <p className="font-mono text-sm text-success">
            This is a stub: purchase flow will be implemented later.
          </p>
        )}
      </div>
    </div>
  );
}
