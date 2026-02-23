// src/app/nudi-analyzer/page.jsx

"use client";

import { analyzeNudi } from "@/lib/nudiAnalyzer";

export default function NudiAnalyzerPage() {

    const junkText = `=jÈ : %Ôj"Y<j !Z æloÔj;jbš %fO""Aj úDjÚj<j"‹ Ajûèjrä Do‹<j;j Au|èu ^AoYDjæu|ú|? !;jÚurà]Ôu Ajûèjr dà;kj" AoÔj;u? $ úDjÚj" <jID}
qTÚj"Ajû;u? Au"ã :j"YDj"Aj ÓoÚjL]à;j %Ôj"Y<jZO"bš Du|Új"Aj æuAjÚj" ÔjXªOt;j";j" #;jÚjbš Du|Új"Ajû;u|?
% : Ajûèjr Aj":j"‰ Do‹<j dà;kj" AoÔjP" %Ôj"Y<j !Z æloÔj Ôjèjbš Du|YÚj"Aj úDjÚj<j"‹ ^AoYDjæu|ú<j"‹Ajû;oT;u =jÈN?ovl=oÈO"å BjY|Új;jbš
æuAjY<j :u|AoàBjaÚj"AoÔj Ao:oAjÚjL;jbš Du|YúràZ Új"Aj ;kjrèj" #;jùxàXúràÛj" %Ôj"Y^à;j úÚuO""AoÔj #;j" úDjY<jà:u (;j"Š
NÚj":j‰;uå #;jÚurèjæloÔjúx ^|Új" DjŒBj~ AoÔj;j ÓoÚjL Ajûèjr dà;kj" AoÔjP" #;j<j"‹ ^AoYDjæu|ù"å
ú|AjP úDjÚj" <jID} !Pšå <jID} qT BjÚj!} (@dÚj"Aj Aj"Pä Aj"r:jÈä Aoà\ä Újù‰ Aj""à:o;j Aj"b<jÔjèj" úDjY<jbš Du|YúràZ;j"Š
GU:ja;jŠÚu !;j" <jID} qÔj"Ajû;jCuªå`

    const result = analyzeNudi(junkText);

    const sortedTrigrams = Object.entries(result.trigramFreq)
        .sort((a, b) => b[1] - a[1]);

    console.log("Top Trigrams:", sortedTrigrams.slice(0, 50));

    console.log(result);



    return (
        <div style={{ padding: 40 }}>
            <h1>Nudi Analyzer</h1>
            <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
    );
}