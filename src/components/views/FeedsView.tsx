import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function FeedsView() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Feeds</CardTitle>
          <CardDescription>
            Manage your RSS feeds and content sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              No feeds configured yet. Add your first feed to get started.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
} 