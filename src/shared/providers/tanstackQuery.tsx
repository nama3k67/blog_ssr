import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

interface TanstackQueryProviderProps {
	children: React.ReactNode;
}

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				// With SSR, set staleTime above 0 to avoid re-fetching immediately on the client
				staleTime: 60 * 1000,
			},
		},
	});
}

export let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
	if (typeof window === "undefined") {
		// Server: always make a new query client
		return makeQueryClient();
	}
	// Browser: reuse the same query client
	if (!browserQueryClient) browserQueryClient = makeQueryClient();
	return browserQueryClient;
}

export function TanstackQueryProvider({
	children,
}: TanstackQueryProviderProps) {
	const [queryClient] = useState(getQueryClient);
	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}
