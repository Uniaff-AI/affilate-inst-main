// Mobile detection utilities
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isIOS = () => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isAndroid = () => {
  if (typeof window === 'undefined') return false;
  return /Android/.test(navigator.userAgent);
};

// Touch detection
export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Screen size detection
export const getScreenSize = () => {
  if (typeof window === 'undefined') return 'lg';
  
  const width = window.innerWidth;
  if (width < 640) return 'sm';
  if (width < 768) return 'md';
  if (width < 1024) return 'lg';
  if (width < 1280) return 'xl';
  return '2xl';
};

// Safe area utilities
export const getSafeAreaInsets = () => {
  if (typeof window === 'undefined') return { top: 0, bottom: 0, left: 0, right: 0 };
  
  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue('--sat') || '0'),
    bottom: parseInt(style.getPropertyValue('--sab') || '0'),
    left: parseInt(style.getPropertyValue('--sal') || '0'),
    right: parseInt(style.getPropertyValue('--sar') || '0'),
  };
};

// Mobile-specific viewport height
export const getMobileViewportHeight = () => {
  if (typeof window === 'undefined') return '100vh';
  
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
  return 'calc(var(--vh, 1vh) * 100)';
};

// Prevent zoom on input focus (iOS)
export const preventZoom = () => {
  if (typeof window === 'undefined') return;
  
  const viewport = document.querySelector('meta[name=viewport]');
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
  }
};

// Enable zoom on input blur (iOS)
export const enableZoom = () => {
  if (typeof window === 'undefined') return;
  
  const viewport = document.querySelector('meta[name=viewport]');
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1');
  }
};

// Add mobile-specific event listeners
export const addMobileListeners = () => {
  if (typeof window === 'undefined') return;
  
  // Prevent double-tap zoom on iOS
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
  
  // Handle orientation change
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      getMobileViewportHeight();
    }, 100);
  });
  
  // Handle resize
  window.addEventListener('resize', () => {
    getMobileViewportHeight();
  });
};

// Initialize mobile utilities
export const initMobileUtils = () => {
  if (typeof window === 'undefined') return;
  
  getMobileViewportHeight();
  addMobileListeners();
  
  // Set CSS custom properties for safe areas
  const insets = getSafeAreaInsets();
  document.documentElement.style.setProperty('--sat', `${insets.top}px`);
  document.documentElement.style.setProperty('--sab', `${insets.bottom}px`);
  document.documentElement.style.setProperty('--sal', `${insets.left}px`);
  document.documentElement.style.setProperty('--sar', `${insets.right}px`);
}; 