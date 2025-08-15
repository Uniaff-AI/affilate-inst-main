'use client';

import { useEffect, useState } from 'react';
import { isMobile, isIOS, isAndroid, isTouchDevice, getScreenSize } from '@/lib/mobileUtils';

export default function TestMobilePage() {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    isTouch: false,
    screenSize: 'lg',
    userAgent: '',
    viewport: { width: 0, height: 0 },
    orientation: 'portrait',
    pixelRatio: 1,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDeviceInfo({
        isMobile: isMobile(),
        isIOS: isIOS(),
        isAndroid: isAndroid(),
        isTouch: isTouchDevice(),
        screenSize: getScreenSize(),
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
        pixelRatio: window.devicePixelRatio,
      });

      const handleResize = () => {
        setDeviceInfo(prev => ({
          ...prev,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
          orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
          screenSize: getScreenSize(),
        }));
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-violet-50 px-4 py-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-violet-600">
          Mobile Testing Page
        </h1>

        {/* Device Info Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Device Detection */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Device Detection</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Mobile Device:</span>
                <span className={`font-medium ${deviceInfo.isMobile ? 'text-green-600' : 'text-red-600'}`}>
                  {deviceInfo.isMobile ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">iOS:</span>
                <span className={`font-medium ${deviceInfo.isIOS ? 'text-green-600' : 'text-red-600'}`}>
                  {deviceInfo.isIOS ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Android:</span>
                <span className={`font-medium ${deviceInfo.isAndroid ? 'text-green-600' : 'text-red-600'}`}>
                  {deviceInfo.isAndroid ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Touch Device:</span>
                <span className={`font-medium ${deviceInfo.isTouch ? 'text-green-600' : 'text-red-600'}`}>
                  {deviceInfo.isTouch ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Screen Information */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Screen Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Screen Size:</span>
                <span className="font-medium text-violet-600">{deviceInfo.screenSize.toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Width:</span>
                <span className="font-medium">{deviceInfo.viewport.width}px</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Height:</span>
                <span className="font-medium">{deviceInfo.viewport.height}px</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Orientation:</span>
                <span className="font-medium text-violet-600">{deviceInfo.orientation}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pixel Ratio:</span>
                <span className="font-medium">{deviceInfo.pixelRatio}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Test Elements */}
        <div className="mt-8 space-y-6">
          {/* Responsive Grid */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Responsive Grid Test</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-violet-100 rounded-lg p-4 text-center">
                  <div className="text-violet-600 font-semibold">Item {i + 1}</div>
                  <div className="text-xs text-violet-500 mt-1">Responsive</div>
                </div>
              ))}
            </div>
          </div>

          {/* Responsive Typography */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Responsive Typography Test</h2>
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800">
                Responsive Heading
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-gray-600">
                This text should scale appropriately on different screen sizes. 
                On mobile it should be smaller and on desktop it should be larger.
              </p>
              <div className="text-xs sm:text-sm md:text-base text-gray-500">
                Small text that also scales responsively
              </div>
            </div>
          </div>

          {/* Touch-friendly Buttons */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Touch-friendly Buttons Test</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button className="btn-primary text-sm sm:text-base">
                Primary Button
              </button>
              <button className="rounded-lg border border-gray-300 px-4 py-3 text-sm sm:text-base hover:bg-gray-50">
                Secondary
              </button>
              <button className="rounded-lg bg-green-500 text-white px-4 py-3 text-sm sm:text-base hover:bg-green-600">
                Success
              </button>
              <button className="rounded-lg bg-red-500 text-white px-4 py-3 text-sm sm:text-base hover:bg-red-600">
                Danger
              </button>
            </div>
          </div>

          {/* Responsive Cards */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Responsive Cards Test</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card p-4 sm:p-6">
                  <div className="h-32 bg-gradient-to-br from-violet-100 to-pink-100 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Card {i + 1}</h3>
                  <p className="text-sm text-gray-600">
                    This card demonstrates responsive padding and spacing that adapts to different screen sizes.
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile-specific Features */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Mobile-specific Features</h2>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Try these on mobile:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    Swipe gestures
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    Touch feedback
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                    Safe areas
                  </span>
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                    Responsive layout
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Agent Info */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">User Agent Information</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <code className="text-xs text-gray-700 break-all">
              {deviceInfo.userAgent}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
} 