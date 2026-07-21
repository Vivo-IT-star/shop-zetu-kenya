import React, {useState, useEffect} from 'react';
import {X, Mail, Gift, Sparkles} from 'lucide-react';
import {time} from 'framer-motion';

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

  // --- UTC ---
  const utcWeekday = weekdays[date.getUTCDay()];
  const utcMonth = months[date.getUTCMonth()];
  const utcDay = pad2(date.getUTCDate());
  const utcYear = date.getUTCFullYear();
  const utcHour = pad2(date.getUTCHours());
  const utcMinute = pad2(date.getUTCMinutes());
  const utcSecond = pad2(date.getUTCSeconds());
  const ms3 = pad3(date.getUTCMilliseconds());

  const utc = `${utcWeekday} ${utcMonth} ${utcDay} ${utcYear} ${utcHour}:${utcMinute}:${utcSecond}.${ms3} UTC`;

  // --- Nairobi (UTC + 3) ---
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

// Interval types
export type PopupInterval =
  | 'immediately'
  | '1-hour'
  | '24-hours'
  | '2-weeks'
  | '1-month'
  | 'never';

interface KlaviyoPopupProps {
  isOpen?: boolean;
  onClose?: () => void;
  logoUrl?: string;
  interval?: PopupInterval;
  storageKey?: string; // Custom storage key for multiple popups
}

const KlaviyoPopup = ({
  isOpen = false,
  onClose = () => {},
  logoUrl = 'https://via.placeholder.com/80x80/000000/FFFFFF?text=LOGO',
  interval = '1-month',
  storageKey = 'zetu-popup',
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+254',
    phoneNumber: '',
    birthday: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [shouldShow, setShouldShow] = useState(false);

  // Interval durations in milliseconds
  const intervalDurations = {
    immediately: 0,
    '1-hour': 60 * 60 * 1000,
    '24-hours': 24 * 60 * 60 * 1000,
    '2-weeks': 14 * 24 * 60 * 60 * 1000,
    '1-month': 30 * 24 * 60 * 60 * 1000,
    never: Infinity,
  };

  // Check if popup should be shown based on interval
  const checkShouldShow = () => {
    if (interval === 'never') return false;

    const stored = localStorage.getItem(storageKey);
    if (!stored) return true; // First time - show popup

    try {
      const {lastShown, timestamp, subscribed} = JSON.parse(stored) as {
        lastShown: number;
        timestamp: string;
        subscribed: boolean;
      };

      // If user has subscribed, don't show again
      if (subscribed) return false;

      const now = Date.now();
      const timeSinceLastShown = now - lastShown;
      const requiredInterval =
        intervalDurations[interval as keyof typeof intervalDurations];

      return timeSinceLastShown >= requiredInterval;
    } catch {
      return true; // If parsing fails, show popup
    }
  };

  const {utc, nairobi} = formatMsToUTCAndNairobi(Date.now());

  // Save popup state to localStorage
  const savePopupState = (subscribed = false) => {
    const state = {
      lastShown: Date.now(),
      timestamp: nairobi,
      subscribed,
      interval,
    };
    localStorage.setItem(storageKey, JSON.stringify(state));
  };

  // Handle popup close
  const handleClose = () => {
    savePopupState(false); // Save that popup was shown but user didn't subscribe
    setShouldShow(false);
    onClose();
  };

  // Handle successful subscription
  const handleSubscriptionSuccess = () => {
    savePopupState(true); // Save that user subscribed
    setIsSubmitted(true);
    setTimeout(() => {
      setShouldShow(false);
      onClose();
    }, 5000);
  };

  // Check if popup should show on mount and when interval changes
  useEffect(() => {
    if (isOpen) {
      setShouldShow(checkShouldShow());
    }
  }, [isOpen, interval, storageKey]);

  // Prevent body scroll when popup is open
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

  const handleInputChange = (e: {target: {name: any; value: any}}) => {
    const {name, value} = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(''); // Clear error when user types
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    // if (!formData.lastName.trim()) {
    //   setError('Last name is required');
    //   return false;
    // }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Age validation - must be at least 16 years old
    if (formData.birthday) {
      const birthDate = new Date(formData.birthday);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      // Calculate exact age
      const exactAge =
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ? age - 1
          : age;

      if (exactAge < 16) {
        setError('You must be at least 16 years old to subscribe');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: {preventDefault: () => void}) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Send data to our API route instead of directly to Klaviyo
      const response = await fetch('/api/klaviyo-subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          countryCode: formData.countryCode,
          birthday: formData.birthday,
        }),
      });

      const result = (await response.json()) as {
        error?: string;
        success?: boolean;
        data?: any;
        code?: string;
      };

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 409 && result.code === 'duplicate_profile') {
          setError(result.error || 'This email address has already been used.');
        } else {
          setError(result.error || 'Something went wrong. Please try again.');
        }
        return;
      }

      console.log('Klaviyo profile created:', result);

      handleSubscriptionSuccess();
    } catch (err) {
      console.error('Subscription error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !shouldShow) return null;

  // Country codes with flags
  const countryCodes = [
    {code: '+1', flag: '🇺🇸', country: 'US'},
    {code: '+1', flag: '🇨🇦', country: 'CA'},
    {code: '+44', flag: '🇬🇧', country: 'UK'},
    {code: '+254', flag: '🇰🇪', country: 'KE'},
    {code: '+234', flag: '🇳🇬', country: 'NG'},
    {code: '+27', flag: '🇿🇦', country: 'ZA'},
    {code: '+33', flag: '🇫🇷', country: 'FR'},
    {code: '+49', flag: '🇩🇪', country: 'DE'},
    {code: '+91', flag: '🇮🇳', country: 'IN'},
    {code: '+86', flag: '🇨🇳', country: 'CN'},
    {code: '+81', flag: '🇯🇵', country: 'JP'},
    {code: '+61', flag: '🇦🇺', country: 'AU'},
    {code: '+55', flag: '🇧🇷', country: 'BR'},
    {code: '+52', flag: '🇲🇽', country: 'MX'},
    {code: '+39', flag: '🇮🇹', country: 'IT'},
    {code: '+34', flag: '🇪🇸', country: 'ES'},
    {code: '+31', flag: '🇳🇱', country: 'NL'},
    {code: '+46', flag: '🇸🇪', country: 'SE'},
    {code: '+47', flag: '🇳🇴', country: 'NO'},
    {code: '+45', flag: '🇩🇰', country: 'DK'},
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

    
      {/* Popup Container */}
      <div className="relative w-full max-w-4xl mx-4 transform transition-all duration-300 scale-100">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute -top-4 -right-4 z-10 w-8 h-8 bg-gray-800 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
        >
          <X size={16} />
        </button>

        {/* Main Popup */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="md:flex md:min-h-[500px]">
            {/* Left Side - Header Section (Desktop) / Top Section (Mobile) */}
            <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 text-white text-center md:w-1/2 md:flex md:flex-col md:justify-center">
              {/* Decorative elements */}
              <div className="absolute top-4 left-4 w-2 h-2 bg-white/30 rounded-full animate-ping"></div>
              <div className="absolute top-6 right-8 w-1 h-1 bg-white/40 rounded-full animate-pulse"></div>
              <div className="absolute bottom-4 right-4 w-3 h-3 bg-white/20 rounded-full animate-bounce"></div>

              {/* Logo */}
              <div className="mb-4 hidden md:block">
                <div className="w-16 h-16 mx-auto bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="w-12 h-12 rounded-xl object-contain"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                      const next = img.nextSibling;
                      if (next && next instanceof HTMLElement) {
                        next.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="hidden w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-2">Would You Like...</h2>
              <div className="inline-flex items-center justify-center mb-3 bg-yellow-400 text-black px-4 py-1 rounded-full font-bold text-lg">
                <Gift className="w-4 h-4 mr-1" />
                5% OFF
              </div>
              <p className="text-sm opacity-90">Everything, Kila Kitu!</p>
              {/* <p className="text-xs mt-1 opacity-75">
                Be the <strong>first one to save the exclusive</strong><br />
                deals as well as the useful articles!
              </p> */}
            </div>

            {/* Right Side - Form Section */}
            <div className="p-6 md:w-1/2 flex md:flex-col md:justify-center">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className='flex space-x-2'>

                         {/* First Name */}
                  <div className=''>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
                      required
                    />
                  </div>

                    <div className=''>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email for coupons"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
                      required
                    />
                  </div>

                  {/* Last Name */}
                  {/* <div>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
                    required
                  />
                </div> */}

                  </div>
             

                  {/* Email */}
                  {/* <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email for coupons"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
                      required
                    />
                  </div> */}

                  {/* Phone Number */}
                  <div className="flex space-x-2">
                    {/* Country Code Selector */}
                    <div>
                      <select
                        name="countryCode"
                        value={formData.countryCode}
                        onChange={handleInputChange}
                        className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none bg-white"
                      >
                        {countryCodes.map((country, index) => (
                          <option
                            key={`${country.code}-${country.country}-${index}`}
                            value={country.code}
                          >
                            {country.flag} {country.code}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Phone Number Input */}
                    <div className="flex-1">
                      <input
                        type="tel"
                        name="phoneNumber"
                        placeholder="Phone Number"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
                      />
                    </div>
                  </div>

                  {/* Birthday */}
                  <div>
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Birthday
                      </label>
                      <input
                        type="date"
                        name="birthday"
                        value={formData.birthday}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
                      />
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-black hover:bg-gray-800 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Subscribing...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Email Me the COUPON
                      </>
                    )}
                  </button>

                  {/* Footer Link */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
                    >
                      No, I hate saving money!
                    </button>
                  </div>
                </form>
              ) : (
                /* Success Message */
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Welcome Aboard! 🎉
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Your 5% discount coupon is on its way!
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      Check your email for your exclusive discount code.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for managing popup state
export const useKlaviyoPopup = (
  interval: PopupInterval = '2-weeks',
  storageKey = 'zetu-popup',
) => {
  const [isOpen, setIsOpen] = useState(false);

  // durations in ms
  const intervalDurations = {
    immediately: 0,
    '1-hour': 60 * 60 * 1000,
    '24-hours': 24 * 60 * 60 * 1000,
    '2-weeks': 14 * 24 * 60 * 60 * 1000,
    '1-month': 30 * 24 * 60 * 60 * 1000,
    never: Infinity,
  };

  const checkAndOpen = () => {
    // console.log("Checking interval and popup state @", new Date().toISOString());
    if (interval === 'never') return;

    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      // First time — show immediately
      setIsOpen(true);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as {
        interval: string;
        lastShown: number;
        timestamp: string;
        subscribed: boolean;
      };

      if (!parsed.timestamp) {
        const {utc, nairobi} = formatMsToUTCAndNairobi(parsed.lastShown);
        const enriched = {
          ...parsed,
          interval: '2-weeks',
          timestamp: nairobi,
        };
        localStorage.setItem(storageKey, JSON.stringify(enriched));
      } else {
        parsed.interval = '2-weeks'; // force 2 weeks
        localStorage.setItem(storageKey, JSON.stringify(parsed)); // ✅ persist it
      }

      if (parsed.subscribed) return; // ✅ never show again if subscribed

      const now = Date.now();
      const requiredInterval =
        intervalDurations[interval as keyof typeof intervalDurations];

      if (now - parsed.lastShown >= requiredInterval) {
        setIsOpen(true);
      }
    } catch {
      setIsOpen(true); // fallback
    }
  };

  useEffect(() => {
    checkAndOpen(); // check on mount

    if (interval === 'immediately' || interval === 'never') return;

    const intervalId = setInterval(checkAndOpen, 3000); // check every 3s
    return () => clearInterval(intervalId);
  }, [interval, storageKey]);

  const {utc, nairobi} = formatMsToUTCAndNairobi(Date.now());

  // when dismissed without subscribing → save lastShown
  const closePopup = () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        lastShown: Date.now(),
        timestamp: nairobi,
        subscribed: false,
        interval,
      }),
    );
    setIsOpen(false);
  };

  // when subscribed → save subscribed = true
  const subscribePopup = () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        lastShown: Date.now(),
        timestamp: nairobi,
        subscribed: true,
        interval,
      }),
    );
    setIsOpen(false);
  };

  return {
    isOpen,
    openPopup: () => setIsOpen(true),
    closePopup,
    subscribePopup,
  };
};

// Demo Component to show the popup
const PopupDemo = () => {
  const [currentInterval, setCurrentInterval] =
    useState<PopupInterval>('immediately');
  const {isOpen, openPopup, closePopup} = useKlaviyoPopup(currentInterval);

  // Reset localStorage for demo purposes
  const resetPopupState = () => {
    localStorage.removeItem('zetu-popup');
    openPopup();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Newsletter Popup Demo
        </h1>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Popup Interval:
          </label>
          <select
            value={currentInterval}
            onChange={(e) =>
              setCurrentInterval(e.target.value as PopupInterval)
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="immediately">Immediately</option>
            <option value="1-hour">1 Hour</option>
            <option value="24-hours">24 Hours</option>
            <option value="1-week">1 Week</option>
            <option value="1-month">1 Month</option>
            <option value="never">Never</option>
          </select>
        </div>

        <div className="space-x-4 mb-8">
          <button
            onClick={openPopup}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Show Popup
          </button>
          <button
            onClick={resetPopupState}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Reset & Show
          </button>
        </div>

        <div className="mt-8 p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto text-left">
          <h3 className="font-bold mb-2">Popup Interval System:</h3>
          <ul className="text-sm space-y-1 text-gray-600">
            <li>
              <strong>Immediately:</strong> Shows every time (no delay)
            </li>
            <li>
              <strong>1 Hour:</strong> Shows again after 1 hour
            </li>
            <li>
              <strong>24 Hours:</strong> Shows again after 24 hours
            </li>
            <li>
              <strong>1 Week:</strong> Shows again after 1 week
            </li>
            <li>
              <strong>1 Month:</strong> Shows again after 1 month
            </li>
            <li>
              <strong>Never:</strong> Won't show again after first close
            </li>
          </ul>
          <p className="text-xs mt-2 text-gray-500">
            Once a user subscribes, the popup won't appear again regardless of
            interval.
          </p>
        </div>
      </div>

      <KlaviyoPopup
        isOpen={isOpen}
        onClose={closePopup}
        logoUrl="https://via.placeholder.com/80x80/6366F1/FFFFFF?text=✨"
        interval={currentInterval}
      />
    </div>
  );
};

export default KlaviyoPopup;
