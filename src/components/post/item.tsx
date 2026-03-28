import type { LinkProps } from "@tanstack/react-router";
import { useI18n } from "~/shared/providers/i18n";
import type { PostSummary } from "~/shared/types/post";
import { formatDate } from "~/shared/utils/date";
import { Card } from "../shared/card";

type Props = {
	data: PostSummary;
	linkProps: LinkProps;
};

export const PostItem = ({ data, linkProps }: Props) => {
	const { t } = useI18n();

	return (
		<article className='md:grid md:grid-cols-4 md:items-baseline'>
			<Card className='md:col-span-3'>
				{data.featuredImage && (
					<img
						src={data.featuredImage}
						alt={data.title || "Post featured image"}
						loading='lazy'
						className='relative z-10 mb-4 aspect-video w-full rounded-2xl object-cover'
					/>
				)}

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

				{data.category && (
					<span className='relative z-10 mt-3 inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'>
						{data.category.name}
					</span>
				)}

				<Card.Description>{data.description}</Card.Description>

				<Card.Cta>{t.common.readMore}</Card.Cta>
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
