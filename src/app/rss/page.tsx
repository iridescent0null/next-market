"use client"
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react"
import Parser from 'rss-parser';
import { getRootURL } from "../utlis/config";
import Image from "next/image";
import Config from "../utlis/config";

interface Article {
    contentSnippet: string;
    guid: string;
	img?: string;
}

const srcURLRegex = /(?<=(src=\"))[^><]*(?=\")/;

const RSS = () => {
    const [articles,setArticles] = useState<Article[]>();
    const parser = new Parser();

	const searchParams = useSearchParams();

    useEffect(() => {
        const hydrate = () => {
            parser.parseURL(searchParams.get("mocked") === "true"?
					`${getRootURL()}/mock/rss.xml`
					:Config.externalResource.rss1URL
			)
            .then(rssf => {
                return rssf.items.map(item => {
					const srcInArray = item.content!.match(srcURLRegex);
					return {
						contentSnippet: item.contentSnippet,
						guid: item.guid,
						img: (srcInArray && srcInArray[0].length > 1)? srcInArray[0] : undefined
                } as Article});
            })
            .then(articles => {
                setArticles(articles);
            })
            .catch(err => {
                console.error(err);
            })
        };
        hydrate();
    },
    []
    );

    return <> {!articles ?<>loading...</>:
        <>
            <div>
                {articles.map(article => 
					<div key={article.guid} className="uma-rss-article">
						<div >{article.contentSnippet}</div>
						{!article.img?<>thumbnail missing</>:
							<Image src={article.img} alt={article.contentSnippet} width="200" height="200"/>
						}
					</div>
					)
				}
            </div>
        </>
        }
    </>;
}
export default RSS;


