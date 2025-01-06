import "./App.css";
import { BranchLayoutContainer } from "@/components/BranchLayout";
import CommitDetails, {
	CommitDetailsContainer,
} from "@/components/CommitDetails";
import { ThemeProvider } from "@/components/theme-provider";
import { RouterProvider, createBrowserRouter } from "react-router";
import AppLayout from "./components/AppLayout";
import { CommitHistoryContainer } from "./components/CommitHistory";
import {
	CurrentChange,
	CurrentChangeContainer,
} from "./components/CurrentChange";
import SelectDirectoryView from "./components/SelectDirectoryView";

const router = createBrowserRouter([
	{
		path: "/",
		element: <SelectDirectoryView />,
	},
	{
		path: "dashboard",
		element: <AppLayout />,
		children: [
			{
				path: "path/:pathId",
				element: <BranchLayoutContainer />,
				children: [
					{
						path: "branch/:branchId",
						element: <CommitHistoryContainer />,
						children: [
							{
								path: "commit/:commitId",
								element: <CommitDetailsContainer />,
							},
							{
								path: "current_change",
								element: <CurrentChangeContainer />,
							},
						],
					},
				],
			},
		],
	},
]);

function App() {
	return (
		<ThemeProvider>
			<RouterProvider router={router} />
		</ThemeProvider>
	);
}

export default App;
