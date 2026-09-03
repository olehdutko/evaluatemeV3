'use client';

import Link from 'next/link';
import { Modal } from '../ui/Modal';

export function BuyCreditsPrompt({
  open,
  onClose,
  message,
}: {
  open: boolean;
  onClose: () => void;
  message?: string;
}): JSX.Element | null {
  return (
    <Modal open={open} onClose={onClose} title="Not enough credits">
      <div className="space-y-5">
        <p className="font-body text-text-primary">
          {message || 'Insufficient credits to start this test.'}
        </p>
        <p className="text-sm text-text-secondary font-body">
          Purchase more credits to unlock the quiz and continue testing your skills.
        </p>
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-sm py-2 px-4 text-center"
          >
            Cancel
          </button>
          <Link
            href="/buy-credits"
            onClick={onClose}
            className="btn-primary text-sm py-2 px-4 text-center"
          >
            Buy credits
          </Link>
        </div>
      </div>
    </Modal>
  );
}
