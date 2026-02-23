import { analyzeNudi } from "@/lib/nudiAnalyzer";

const junkText = `<jAjtØ}<jbš :o<j" ^Aj~eDjæu|Óo;j RÈÒ"Ôjèjbš DjàBjO"AjûàÙo;jbš q DjàBjO" ^AoÚjÜuÔu #:jÚjÚj<j"‹ !AjPàvDj"Ajà\Pšå #AjtAj{}
Dj?oAj{} Eu|f;j <jà:jÚj æoR (Cj"ª <jAjtØ} AjtÛjbRx;uÒ"àN";jÚjbš DjàBjO" AjûàÙo;jÚu EuU¥<j Do;kjÇ:uO"<j"‹ eZ;j" <jAjtØ}
AjtÛjæu|ù"å %;o: #AjtAj"Úurà]Ôu +à;j" Újù!:} ^Aj~ed;j îo\È #;j"Š +à;jRxà:j EuÖj"¥ ^Aj~ed;j NÔu¢ DjàBjO"a;jŠÚu +à;j"
Újù!:} Ajt:jÈ :j<jÔu PæljÇAoT;uÒ"à;j" ;jâÛkj=jZd æoR Újù!:}Ôjèj<j"‹ ^Aj~eDj æu|ù"å #;jÓoxT :j<ur‹XªÔu <jAjtØ}<jbš Du|Y;jAjÚj<j"‹
!<j"ùYDj"Ajà\Pšå #<j"‹ :j<ur‹ XªÔu <jAjtØ}Ôu Du|Y;jAjÚj" :jAo:j"Ú}<j DjàîuÇ (!AjÚuPšÚjr Du|Y +ÙoªT Dj"èj"¿ Eu|èjP" Do;kjÇaPš;jCj"ª
Aj"à])O"cª;jŠÚu !AjÚj" æoR (Cj"ª ÚjÓ}!:} AjtZ;jÚuà;j" \f;jbš !;j<j"‹ dº|ùYd !Cuª| Újù!:} ^Aj~eDjNEj";j"å q;jÚu
!;j<j"‹ a|R›DjbÓoxT :j<j‹ <jAjt Ø}<j !=u|R›:j RÈÒ"Ôjèj" Aj""T;j <jà:jÚjAjÑ !AjÚj<j"‹ ÓoO""Ajà \Pšå (%;o: :j<j‹ =ko\Eoä DjrÚo
ø] Aj""T];j"Š !AjÚj" Új"ùr#Ôu Eur|Ôj"Ajû;j<j"‹ Óo;j" ^P"šAjû;j") #;jYà;j <jAjtØ} !dà;kj"AoÔj":j‰;uå`;

console.log(analyzeNudi(junkText));