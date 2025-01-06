import { Outlet } from "react-router";
import TabList from "./TabsList";

const AppLayout = () => {
	return (
		<div className="flex flex-col h-screen w-screen">
			<TabList />
			<div className="flex flex-1 overflow-hidden">
				<Outlet />
			</div>
		</div>
	);
};

export default AppLayout;
