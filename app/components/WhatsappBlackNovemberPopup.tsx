import React, {useState, useEffect} from 'react';
import {X} from 'lucide-react';
import {Image} from '@shopify/hydrogen';

function formatMsToUTCAndNairobi(ms: number | string) {
  const n = typeof ms === 'string' ? Number(ms) : ms;
  if (!Number.isFinite(n)) throw new Error('Invalid ms timestamp');

  const date = new Date(n);

  const pad2 = (v: number) => String(v).padStart(2, '0');
  const pad3 = (v: number) => String(v).padStart(3, '0');
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const utcWeekday = weekdays[date.getUTCDay()];
  const utcMonth = months[date.getUTCMonth()];
  const utcDay = pad2(date.getUTCDate());
  const utcYear = date.getUTCFullYear();
  const utcHour = pad2(date.getUTCHours());
  const utcMinute = pad2(date.getUTCMinutes());
  const utcSecond = pad2(date.getUTCSeconds());
  const ms3 = pad3(date.getUTCMilliseconds());

  const utc = `${utcWeekday} ${utcMonth} ${utcDay} ${utcYear} ${utcHour}:${utcMinute}:${utcSecond}.${ms3} UTC`;

  const nairobiDate = new Date(n + 3 * 60 * 60 * 1000);
  const naiWeekday = weekdays[nairobiDate.getUTCDay()];
  const naiMonth = months[nairobiDate.getUTCMonth()];
  const naiDay = pad2(nairobiDate.getUTCDate());
  const naiYear = nairobiDate.getFullYear();
  const naiHour = pad2(nairobiDate.getUTCHours());
  const naiMinute = pad2(nairobiDate.getUTCMinutes());
  const naiSecond = pad2(nairobiDate.getUTCSeconds());

  const nairobi = `${naiWeekday} ${naiMonth} ${naiDay} ${naiYear} ${naiHour}:${naiMinute}:${naiSecond}.${ms3} EAT`;

  return {utc, nairobi};
}

export type PopupInterval =
  | 'immediately'
  | '1-hour'
  | '24-hours'
  | '1-week'
  | '2-weeks'
  | '1-month'
  | 'never';

interface WhatsAppBlackNovemberChannelPopupProps {
  isOpen?: boolean;
  onClose?: () => void;
  imageUrl?: string;
  channelUrl?: string;
  interval?: PopupInterval;
  storageKey?: string;
}

const WhatsAppBlackNovemberChannelPopup = ({
  isOpen = false,
  onClose = () => {},
  imageUrl = 'https://via.placeholder.com/400x500/000000/FFFFFF?text=Black+Friday',
  channelUrl = 'https://whatsapp.com/channel/your-channel-id',
  interval = '1-month',
  storageKey = 'whatsapp-black-november-channel',
}) => {
  const [shouldShow, setShouldShow] = useState(false);

  const intervalDurations = {
    immediately: 0,
    '1-hour': 60 * 60 * 1000,
    '24-hours': 24 * 60 * 60 * 1000,
    '1-week': 7 * 24 * 60 * 60 * 1000,
    '2-weeks': 14 * 24 * 60 * 60 * 1000,
    '1-month': 30 * 24 * 60 * 60 * 1000,
    never: Infinity,
  };

  const checkShouldShow = () => {
    if (interval === 'never') return false;

    const stored = localStorage.getItem(storageKey);
    if (!stored) return true;

    try {
      const {lastShown, joined} = JSON.parse(stored) as {
        lastShown: number;
        timestamp: string;
        joined: boolean;
      };

      if (joined) return false;

      const now = Date.now();
      const timeSinceLastShown = now - lastShown;
      const requiredInterval =
        intervalDurations[interval as keyof typeof intervalDurations];

      return timeSinceLastShown >= requiredInterval;
    } catch {
      return true;
    }
  };

  const savePopupState = (joined = false) => {
    const {nairobi} = formatMsToUTCAndNairobi(Date.now());
    const state = {
      lastShown: Date.now(),
      timestamp: nairobi,
      joined,
      interval,
    };
    localStorage.setItem(storageKey, JSON.stringify(state));
  };

  const handleClose = () => {
    savePopupState(false);
    setShouldShow(false);
    onClose();
  };

  const handleJoinChannel = () => {
    savePopupState(true);
    window.open(channelUrl, '_blank', 'noopener,noreferrer');
    setTimeout(() => {
      setShouldShow(false);
      onClose();
    }, 1000);
  };

  useEffect(() => {
    if (isOpen) {
      setShouldShow(checkShouldShow());
    }
  }, [isOpen, interval, storageKey]);

  useEffect(() => {
    if (shouldShow && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [shouldShow, isOpen]);

  if (!isOpen || !shouldShow) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute bg-green-500 inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Popup Container */}
      <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 transform transition-all duration-300 scale-100">
     
        <button
          onClick={handleClose}
          className="absolute -top-4 -right-4 z-10 w-8 h-8 bg-gray-800 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
        >
          <X size={16} />
        </button>

        {/* Main Popup */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[86vh]">
          <div className="md:flex md:h-[650px] h-auto">
            {/* Left Side - Image */}
            <div className="relative md:w-1/2 bg-black flex items-center justify-center overflow-hidden h-64 md:h-full">
              <Image
                src={imageUrl}
                alt="Black November WhatsApp Channel"
                sizes="(min-width: 45em) 300px, 100vw"
                loading="eager"
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src =
                    'https://via.placeholder.com/400x500/000000/FFFFFF?text=Black+November';
                }}
              />
            </div>

            {/* Right Side - Call to Action md:w-1/2*/}
            <div className="p-8 md:w-1/2  flex flex-col justify-center items-center text-center overflow-y-auto">
              <div className="max-w-sm ">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Join Us for Exclusive Deals!
                </h2>

                <p className="text-gray-600 mb-6 hidden ">
                     Join Our Black November Channel!
                  Get exclusive Black November deals, early access to sales, and
                  special discounts delivered straight to your WhatsApp!
                </p>

                <div className="space-y-4">
                  <button
                    onClick={handleJoinChannel}
                    className="w-full bg-[#25D366] hover:bg-[#20BD5A] mt-4 text-white py-4 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center text-lg shadow-lg"
                  >
                    <svg
                      className="w-6 h-6 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Connect on WhatsApp
                  </button>

                  <button
                    onClick={handleClose}
                    className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
                  >
                    Maybe later
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                   🔔 Early Access • 🎁 Secret Deals • 🆕 New Arrivals
          
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for managing popup state
export const useWhatsAppBlackNovemberPopup = (
  interval: PopupInterval = '2-weeks',
  storageKey = 'whatsapp-black-november-channel',
) => {
  const [isOpen, setIsOpen] = useState(false);

  const intervalDurations = {
    immediately: 0,
    '1-hour': 60 * 60 * 1000,
    '24-hours': 24 * 60 * 60 * 1000,
    '2-weeks': 14 * 24 * 60 * 60 * 1000,
    '1-month': 30 * 24 * 60 * 60 * 1000,
    never: Infinity,
  };

  const checkAndOpen = () => {
    if (interval === 'never') return;

    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      setIsOpen(true);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as {
        interval: string;
        lastShown: number;
        timestamp: string;
        joined: boolean;
      };

      if (parsed.joined) return;

      const now = Date.now();
      const requiredInterval =
        intervalDurations[interval as keyof typeof intervalDurations];

      if (now - parsed.lastShown >= requiredInterval) {
        setIsOpen(true);
      }
    } catch {
      setIsOpen(true);
    }
  };

  useEffect(() => {
    checkAndOpen();

    if (interval === 'immediately' || interval === 'never') return;

    const intervalId = setInterval(checkAndOpen, 3000);
    return () => clearInterval(intervalId);
  }, [interval, storageKey]);

  const {nairobi} = formatMsToUTCAndNairobi(Date.now());

  const closePopup = () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        lastShown: Date.now(),
        timestamp: nairobi,
        joined: false,
        interval,
      }),
    );
    setIsOpen(false);
  };

  const joinPopup = () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        lastShown: Date.now(),
        timestamp: nairobi,
        joined: true,
        interval,
      }),
    );
    setIsOpen(false);
  };

  return {
    isOpen,
    openPopup: () => setIsOpen(true),
    closePopup,
    joinPopup,
  };
};

export default WhatsAppBlackNovemberChannelPopup;
