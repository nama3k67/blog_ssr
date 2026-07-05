import { useI18n } from "~/shared/providers/i18n";
import type { fetchPostsList } from "~/shared/services/post";
import { formatDate } from "~/shared/utils/date";
import { Card } from "../../shared/card";

type HomePost = Awaited<ReturnType<typeof fetchPostsList>>["posts"][number];

type Props = {
	post: HomePost;
	lang: string;
};

export function Article({ post, lang }: Props) {
	const { t } = useI18n();

	return (
		<Card as='article'>
			<Card.Link to='/$lang/posts/$slug' params={{ slug: post.slug, lang }}>
				<Card.Title>{post.title}</Card.Title>
			</Card.Link>
			<Card.Eyebrow as='time' dateTime={post.date} decorate>
				{formatDate(post.date)}
			</Card.Eyebrow>
			<Card.Description>{post.description}</Card.Description>
			<Card.Cta>{t.pages.home.readArticle}</Card.Cta>
		</Card>
	);
}
