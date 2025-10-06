export const metadata = {
  title: "Encrypted Evaluation System",
  description: "FHEVM-based encrypted assessment dApp",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            background: linear-gradient(135deg, #e8f5e0 0%, #f0f7e0 50%, #e8f5e0 100%);
            color: #2c2c2c;
            min-height: 100vh;
            line-height: 1.6;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}


