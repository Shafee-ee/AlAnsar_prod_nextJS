
export default async function ArticlePage({ params, searchParams }) {
    const { slug } = params;
    const lang = searchParams?.lang || "kn";

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/articles/by-slug?slug=${slug}&lang=${lang}`,
        { next: { revalidate: 60 } }
    );

    if (!res.ok) {
        return <div>Article not found</div>
    }

    const article = await res.json();

    return (
        <article>
            <h1>{article.title}</h1>

            {
                article.image?.path && (
                    <img src={article.image.path}
                        alt={article.image.alt || article.title}
                        style={{ maxWidth: "100%", marginBottom: "1rem" }} />
                )
            }

            <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </article>


    )
}