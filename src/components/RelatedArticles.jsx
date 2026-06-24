"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";

export default function RelatedArticles({ category }) {
  const [articles, setArticles] = useState([]);\
  const {lang} = useLanguage();


  async function loadRelatedArticles(){
    const res=await fetch(`/api/articles?lang=${lang}`); 
    const data = res.json();

    const related =data.articles
    .filter(
        (article)=>
        (
            article.category===category &&
            article.slug === currentSlug && 
            article.status === "published"
        )
    )
    .slice(0,3);


    setArticles(related)

  }

  useEffect(()=>{
    loadRelatedArticles();

  },[category,currentSlug,lang]); 

  return(
    <div>
        <h3 className="font-semibold mb-4">Related Articles</h3>

        {articles.map((article)=>(
            <div key={article.id}>
                {article.title}
            </div>
        ))}
    </div>
  )
}
