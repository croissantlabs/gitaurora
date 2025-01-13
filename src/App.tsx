import "./App.css";
import { BranchLayout } from "@/components/BranchLayout";
import { ThemeProvider } from "@/components/theme-provider";
import { useEffect } from "react";
import { RouterProvider, createBrowserRouter } from "react-router";
import AppLayout from "./components/AppLayout";
import { ChangeDiff } from "./components/ChangeDiff";
import { CommitDetailsLayout } from "./components/CommitDetailsLayout";
import { CommitHistoryLayout } from "./components/CommitHistoryLayout";
import { CommitLayout } from "./components/CommitLayout";
import { CurrentChangeLayout } from "./components/CurrentChangeLayout";
import SelectDirectoryView from "./components/SelectDirectoryView";
import { getUpdate } from "./lib/utils";

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
				element: <BranchLayout />,
				children: [
					{
						path: "branch/:branchId",
						element: <CommitLayout />,
						children: [
							{
								path: "commits",
								element: <CommitHistoryLayout />,
								children: [
									{
										path: ":commitId",
										element: <CommitDetailsLayout />,
										children: [
											{
												path: "filename/:filenameId",
												element: <ChangeDiff />,
											},
										],
									},
								],
							},
							{
								path: "current_change",
								element: <CurrentChangeLayout />,
								children: [
									{
										path: "filename/:filenameId",
										element: <ChangeDiff />,
									},
								],
							},
						],
					},
				],
			},
		],
	},
]);

function App() {
	useEffect(() => {
		getUpdate();
	}, []);

	return (
		<ThemeProvider>
			<RouterProvider router={router} />
		</ThemeProvider>
	);
}

export default App;
