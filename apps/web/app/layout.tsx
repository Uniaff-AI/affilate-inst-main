import './globals.css';

export const metadata = { 
  title: 'Instagram Affiliate',
  description: 'Grow your Instagram network and earn together',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Instagram Affiliate'
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#7a3df2'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
