import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SettingsView() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-medium text-text-normal">Settings</h2>
        <p className="text-sm text-text-muted">
          Configure your Smart Reader preferences
        </p>
      </div>

      <Card className="border-none bg-background-secondary/30 shadow-none">
        <CardContent className="p-4">
          <p className="text-sm text-text-muted">
            Settings configuration coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 