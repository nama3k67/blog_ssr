import { List } from "lucide-react";
import type React from "react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTrigger,
} from "~/components/ui/dialog";
import { NAVBAR_ITEMS } from "../constant";
import MobileNavbarItem from "./item";

export default function MobileNavbar({
	...props
}: React.ComponentPropsWithoutRef<"div">) {
	const [open, setOpen] = useState(false);

	return (
		<div {...props}>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button variant="outline" className="rounded-full">
						<List />
					</Button>
				</DialogTrigger>
				<DialogPortal>
					<DialogOverlay className="bg-zinc-800/40! backdrop-blur-sm" />

					<DialogContent className="sm:max-w-106.25 gap-0">
						<DialogHeader className="text-start mb-4">
							{/* <DialogTitle className="text-zinc-600 font-medium text-base">
								<div className="flex">
									<ThemeToggle />
								</div>
							</DialogTitle>

							<DialogDescription hidden>{navigation.title}</DialogDescription> */}
						</DialogHeader>

						<nav>
							<ul className="-my-2 divide-y divide-zinc-100 text-base text-zinc-800 dark:divide-zinc-100/5 dark:text-zinc-300">
								{NAVBAR_ITEMS.map((item) => (
									<MobileNavbarItem
										key={item.name}
										href={item.href}
										setOpen={setOpen}
									>
										{item.name}
									</MobileNavbarItem>
								))}
							</ul>
						</nav>
					</DialogContent>
				</DialogPortal>
			</Dialog>
		</div>
	);
}
