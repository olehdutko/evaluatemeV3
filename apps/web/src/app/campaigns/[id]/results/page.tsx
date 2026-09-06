'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { CampaignResults } from '../../../../components/campaigns/CampaignResults';
import { Breadcrumbs } from '../../../../components/ui/Breadcrumbs';
import { CORPORATE_API_BASE } from '../../../../lib/corporate-api';

function truncateLabel(name: string): string {
  return name.length > 40 ? `${name.slice(0, 40)}…` : name;
}

export default function CampaignResultsPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId') ?? '';
  const [campaignName, setCampaignName] = useState<string>('Campaign');

  useEffect(() => {
    if (!companyId || !id) return;
    fetch(`${CORPORATE_API_BASE}/api/v1/corporate/campaigns/${id}?companyId=${encodeURIComponent(companyId)}`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) return;
        const json = (await res.json()) as { data: { name: string } };
        setCampaignName(json.data.name);
      })
      .catch(() => undefined);
  }, [id, companyId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: 'Campaigns', href: `/campaigns?companyId=${encodeURIComponent(companyId)}` },
          { label: truncateLabel(campaignName), href: `/campaigns/${id}?companyId=${encodeURIComponent(companyId)}` },
          { label: 'Results' },
        ]}
      />
      <h1 className="mb-6 text-2xl font-bold">Campaign Results</h1>
      <CampaignResults campaignId={id} companyId={companyId} />
    </div>
  );
}
