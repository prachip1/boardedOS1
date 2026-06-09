import Head from 'next/head'

export default function SEO({
  title = 'Boarded - Client Management for Freelancers & Indie Founders',
  description = 'Manage your entire client workflow from onboarding to delivery in one clean workspace built for freelancers and indie founders.',
  keywords = 'client management, freelancer tools, project management, time tracking, invoicing, contracts, freelancer software, indie founder tools',
  image = 'https://boarded.vercel.app/og-image.png',
  url = 'https://boarded.vercel.app',
  type = 'website',
  author = 'Boarded',
  publishedTime,
  modifiedTime,
  noindex = false
}) {
  const fullTitle = title.includes('Boarded') ? title : `${title} | Boarded`
  
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content={noindex ? 'noindex,nofollow' : 'index,follow'} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Boarded" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      <meta property="twitter:creator" content="@boarded" />
      <meta property="twitter:site" content="@boarded" />
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#6366f1" />
      <meta name="msapplication-TileColor" content="#6366f1" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Boarded" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Favicon */}
      <link rel="icon" type="image/png" sizes="32x32" href="/boardedi.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/boardedi.png" />
      <link rel="apple-touch-icon" href="/boardedi.png" />
      
      {/* Manifest */}
      <link rel="manifest" href="/manifest.json" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Boarded",
            "description": description,
            "url": url,
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "description": "Free during beta"
            },
            "author": {
              "@type": "Organization",
              "name": "Boarded"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "150"
            }
          })
        }}
      />
      
      {/* Article specific meta tags */}
      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
    </Head>
  )
}
