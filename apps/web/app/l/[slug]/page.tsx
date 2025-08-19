'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

export default function ReferralLinkPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleReferralLink = async () => {
      try {
        const slug = params.slug as string;
        const utmSource = searchParams.get('utm_source');
        const utmMedium = searchParams.get('utm_medium');
        const utmCampaign = searchParams.get('utm_campaign');

        // Перенаправляем напрямую на API
        const apiUrl = 'http://localhost:14000';
        const redirectUrl = `${apiUrl}/l/${slug}?${new URLSearchParams({
          utm_source: utmSource || '',
          utm_medium: utmMedium || '',
          utm_campaign: utmCampaign || '',
        })}`;
        
        window.location.href = redirectUrl;
        return;
      } catch (err) {
        console.error('Error handling referral link:', err);
        setError('Произошла ошибка при обработке ссылки');
        setLoading(false);
      }
    };

    handleReferralLink();
  }, [params.slug, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-orange-500">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-2">Перенаправление...</h1>
          <p className="text-lg opacity-90">Пожалуйста, подождите</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 to-red-800">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-2">Ошибка</h1>
          <p className="text-lg opacity-90">{error}</p>
          <button 
            onClick={() => window.history.back()} 
            className="mt-4 px-6 py-2 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-orange-500">
      <div className="text-center text-white">
        <h1 className="text-2xl font-bold mb-2">Ссылка обработана</h1>
        <p className="text-lg opacity-90">Спасибо за переход!</p>
      </div>
    </div>
  );
}
