import { Toaster } from "@/components/ui/toaster";
import { db } from "@/db/dexie";
import { useLiveQuery } from "dexie-react-hooks";
import { Outlet } from "react-router";
import TabList from "./TabsList";

const AppLayout = () => {
	const paths = useLiveQuery(() => db.paths.toArray());

	if (!paths) return null;

	return (
		<div className="flex flex-col h-screen w-screen">
			<TabList paths={paths} />
			<div className="flex flex-1 overflow-hidden">
				<Outlet context={paths} />
			</div>
			<Toaster />
		</div>
	);
};

export default AppLayout;
