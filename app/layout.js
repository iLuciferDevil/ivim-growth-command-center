import './globals.css';

export const metadata = {
  title: 'IVÍM Growth Command Center',
  description: 'CEO-facing acquisition, funnel leakage, channel economics and 90-day growth plan.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}