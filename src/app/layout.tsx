import './globals.css'

export const metadata = {
  title: 'Babel Designs',
  description: 'Premium interior design and custom furniture studio. Crafted for all, owned by few.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  )
}