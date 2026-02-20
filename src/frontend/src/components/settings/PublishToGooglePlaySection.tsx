import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Smartphone, ExternalLink, CheckCircle2, Circle, FileText } from 'lucide-react';
import { StoreAssetsPanel } from './StoreAssetsPanel';

export function PublishToGooglePlaySection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Publish to Google Play
        </CardTitle>
        <CardDescription>
          Step-by-step guide to publish MetalHead as an Android app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            Google Play requires an Android App Bundle (AAB) file, not a website link. 
            Follow the steps below to create and submit your app.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Publishing Checklist</h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Circle className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <p className="font-medium text-sm">Create a Google Play Developer Account</p>
                <p className="text-xs text-muted-foreground">
                  Sign up at Google Play Console (one-time $25 fee required)
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => window.open('https://play.google.com/console', '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Open Play Console
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Circle className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <p className="font-medium text-sm">Generate an Android App Bundle (AAB)</p>
                <p className="text-xs text-muted-foreground">
                  Convert your web app into an Android app using the Trusted Web Activity workflow. 
                  See the detailed guide in the repository documentation.
                </p>
                <div className="mt-2 p-2 rounded bg-background border text-xs font-mono">
                  frontend/docs/google-play-aab.md
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Circle className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <p className="font-medium text-sm">Upload Your AAB to Play Console</p>
                <p className="text-xs text-muted-foreground">
                  In Play Console, create a new app and upload the AAB file you generated in the previous step.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Circle className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <p className="font-medium text-sm">Complete Play Console Forms</p>
                <p className="text-xs text-muted-foreground">
                  Fill in required information:
                </p>
                <ul className="text-xs text-muted-foreground list-disc list-inside ml-2 mt-1 space-y-0.5">
                  <li>Data Safety: Describe what user data you collect</li>
                  <li>Target Audience: Set age rating (18+)</li>
                  <li>Content Rating: Complete the questionnaire</li>
                  <li>Store Listing: Add app description, screenshots, and icon</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Circle className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <p className="font-medium text-sm">Submit for Review</p>
                <p className="text-xs text-muted-foreground">
                  Once all forms are complete, submit your app for review. 
                  Google typically takes 1-3 days to review submissions.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Alert>
          <FileText className="h-4 w-4" />
          <AlertTitle>Step-by-Step AAB Guide</AlertTitle>
          <AlertDescription>
            For detailed instructions on generating the Android App Bundle, 
            including package naming, signing, and Digital Asset Links setup, 
            read the complete guide in the repository at{' '}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">
              frontend/docs/google-play-aab.md
            </code>
          </AlertDescription>
        </Alert>

        <StoreAssetsPanel />
      </CardContent>
    </Card>
  );
}
