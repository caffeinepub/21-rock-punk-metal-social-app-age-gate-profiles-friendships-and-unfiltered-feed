import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ExternalLink, Image } from 'lucide-react';

interface StoreAsset {
  filename: string;
  path: string;
  dimensions: string;
  description: string;
}

const storeAssets: StoreAsset[] = [
  {
    filename: 'store-icon.dim_512x512.png',
    path: '/assets/generated/store-icon.dim_512x512.png',
    dimensions: '512×512',
    description: 'High-res app icon',
  },
  {
    filename: 'store-feature-graphic.dim_1024x500.png',
    path: '/assets/generated/store-feature-graphic.dim_1024x500.png',
    dimensions: '1024×500',
    description: 'Feature graphic',
  },
  {
    filename: 'store-screenshot-landing.dim_1080x1920.png',
    path: '/assets/generated/store-screenshot-landing.dim_1080x1920.png',
    dimensions: '1080×1920',
    description: 'Landing page screenshot',
  },
  {
    filename: 'store-screenshot-feed.dim_1080x1920.png',
    path: '/assets/generated/store-screenshot-feed.dim_1080x1920.png',
    dimensions: '1080×1920',
    description: 'Feed page screenshot',
  },
  {
    filename: 'store-screenshot-profile.dim_1080x1920.png',
    path: '/assets/generated/store-screenshot-profile.dim_1080x1920.png',
    dimensions: '1080×1920',
    description: 'Profile page screenshot',
  },
];

export function StoreAssetsPanel() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-sm mb-1">Store Listing Assets</h3>
        <p className="text-xs text-muted-foreground">
          Download these images to use in your Google Play store listing
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {storeAssets.map((asset) => (
          <Card key={asset.filename} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Image className="h-4 w-4" />
                {asset.description}
              </CardTitle>
              <CardDescription className="text-xs">
                {asset.dimensions} • {asset.filename}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="aspect-square sm:aspect-video bg-muted rounded-lg overflow-hidden border">
                <img
                  src={asset.path}
                  alt={asset.description}
                  className="w-full h-full object-contain"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => window.open(asset.path, '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                Open Full Size
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Alert className="mt-4">
        <AlertDescription className="text-xs">
          <strong>PWA Icons:</strong> The app also includes Progressive Web App icons at{' '}
          <code className="bg-muted px-1 py-0.5 rounded">
            /assets/generated/pwa-icon.dim_192x192.png
          </code>{' '}
          and{' '}
          <code className="bg-muted px-1 py-0.5 rounded">
            /assets/generated/pwa-icon.dim_512x512.png
          </code>
          , which are referenced in the web app manifest for browser installability.
        </AlertDescription>
      </Alert>
    </div>
  );
}
