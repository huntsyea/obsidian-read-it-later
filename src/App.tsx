import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SavesView } from "@/components/views/SavesView";
import { FeedsView } from "@/components/views/FeedsView";
import { SettingsView } from "@/components/views/SettingsView";
import { BookmarkIcon, RssIcon, SettingsIcon } from "lucide-react";

export function App() {
	return (
		<div className="w-full h-full">
			<Tabs defaultValue="saves" className="w-full">
				<div className="px-2 pt-4 pb-0 flex justify-center">
					<TabsList className="bg-transparent inline-flex gap-2">
						<TabsTrigger 
							value="saves" 
							className="bg-background-modifier-border hover:bg-background-modifier-hover data-[state=active]:bg-interactive-accent data-[state=active]:text-background-primary rounded-md px-6 py-2 text-[13px] font-medium transition-all duration-150 ease-in-out text-text-muted min-w-[100px] flex items-center justify-center gap-2"
						>
							<BookmarkIcon className="w-4 h-4" />
							Saves
						</TabsTrigger>
						<TabsTrigger 
							value="feeds" 
							className="bg-background-modifier-border hover:bg-background-modifier-hover data-[state=active]:bg-interactive-accent data-[state=active]:text-background-primary rounded-md px-6 py-2 text-[13px] font-medium transition-all duration-150 ease-in-out text-text-muted min-w-[100px] flex items-center justify-center gap-2"
						>
							<RssIcon className="w-4 h-4" />
							Feeds
						</TabsTrigger>
						<TabsTrigger 
							value="settings" 
							className="bg-background-modifier-border hover:bg-background-modifier-hover data-[state=active]:bg-interactive-accent data-[state=active]:text-background-primary rounded-md px-6 py-2 text-[13px] font-medium transition-all duration-150 ease-in-out text-text-muted min-w-[100px] flex items-center justify-center gap-2"
						>
							<SettingsIcon className="w-4 h-4" />
							Settings
						</TabsTrigger>
					</TabsList>
				</div>

				<div className="px-2 py-4">
					<TabsContent 
						value="saves"
						className="mt-0 ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
					>
						<SavesView />
					</TabsContent>

					<TabsContent 
						value="feeds"
						className="mt-0 ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
					>
						<FeedsView />
					</TabsContent>

					<TabsContent 
						value="settings"
						className="mt-0 ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
					>
						<SettingsView />
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
}
