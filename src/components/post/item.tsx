import type { LinkProps } from "@tanstack/react-router";
import type { PostSummary } from "~/shared/types/post";
import { formatDate } from "~/shared/utils/date";
import { Card } from "../shared/card";

type Props = {
	data: PostSummary;
	linkProps: LinkProps;
};

export const PostItem = ({ data, linkProps }: Props) => {
	return (
		<article className='md:grid md:grid-cols-4 md:items-baseline'>
			<Card className='md:col-span-3'>
				<Card.Link {...linkProps}>
					<Card.Title>{data.title}</Card.Title>
				</Card.Link>

				<Card.Eyebrow
					as='time'
					dateTime={data.date}
					className='md:hidden'
					decorate
				>
					{formatDate(data.date)}
				</Card.Eyebrow>

				<Card.Description>{data.description}</Card.Description>

				<Card.Cta>Read more</Card.Cta>
			</Card>

			<Card.Eyebrow
				as='time'
				dateTime={data.date}
				className='mt-1 hidden md:block'
			>
				{formatDate(data.date)}
			</Card.Eyebrow>
		</article>
	);
};
