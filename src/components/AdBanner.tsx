import { useEffect, FC } from 'react';

declare global {
  interface Window {
    adsbygoogle: any;
  }
}

interface AdBannerProps {
    adClient: string;
    adSlot: string;
}

const AdBanner: FC<AdBannerProps> = ({ adClient, adSlot }) => {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense error:", e);
        }
    }, []);

    if (!adClient || !adSlot) {
        return (
            <div className="my-6 p-4 bg-yellow-100 text-center text-yellow-700 rounded-lg">
                <p className="font-semibold">Ad not configured</p>
                <p className="text-sm">Please provide adClient and adSlot props.</p>
            </div>
        );
    }

    return (
        <div className="my-6 text-center">
            <ins className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={adClient}
                data-ad-slot={adSlot}
                data-ad-format="auto"
                data-full-width-responsive="true"></ins>
        </div>
    );
};

export default AdBanner;