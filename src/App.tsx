import "./App.css";
import { BranchLayout } from "@/components/BranchLayout";
import { ThemeProvider } from "@/components/theme-provider";
import { RouterProvider, createBrowserRouter } from "react-router";
import AppLayout from "./components/AppLayout";
import { CommitChangeDiffContainer } from "./components/CommitChangeDiff";
import { CommitDetailsLayout } from "./components/CommitDetailsLayout";
import { CommitHistoryLayout } from "./components/CommitHistoryLayout";
import { CommitLayout } from "./components/CommitLayout";
import { CurrentChangeDiffContainer } from "./components/CurrentChangeDiff";
import { CurrentChangeLayout } from "./components/CurrentChangeLayout";
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
												element: <CommitChangeDiffContainer />,
											},
										],
									},
									{
										path: "filename/:filenameId",
										element: <CurrentChangeDiffContainer />,
									},
									{
										path: "current_change",
										element: <CurrentChangeLayout />,
										children: [
											{
												path: "filename/:filenameId",
												element: <CurrentChangeDiffContainer />,
											},
										],
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
	return (
		<ThemeProvider>
			<RouterProvider router={router} />
		</ThemeProvider>
	);
}

export default App;
