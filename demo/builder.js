import { VERSION } from "./dist/index.js";
import { WORD_LIST_NAMES, WORD_LIST_SIZES } from "./dist/load.js";
import { KotobaGame, KOTOBA_EMBED_OPTION_KEYS } from "./dist/element.js";
import { embedDay } from "./dist/embed-day.js";
import "./dist/element-define.js";
import { familyEmbedBuilder, FAMILY_EMBED_BUILDER_WORDS } from "./family-embed-builder.js";
const words={en:{...FAMILY_EMBED_BUILDER_WORDS.en,pageDocs:"Docs",pageApi: "API",pitch:"Choose a word list and daily word, preview the game and copy its embed code.",name:"Kotoba means word in Japanese.",nameLink:"About the name",foot:"The setup is in the link. No guesses or personal data is stored.",toGallery:"The word games",makerGame:"A word game",makerGameSays:"Guess a hidden word in English, French, German or Japanese kana.",copyLink:"Copy a link to this game",badDay:"Use a real UTC date written YYYY-MM-DD, today or off.",badSettings:"Choose 4–6 letters, or 3–5 Japanese kana."},ja:{...FAMILY_EMBED_BUILDER_WORDS.ja,pageDocs:"ドキュメント",pageApi:"APIリファレンス",pitch:"単語の一覧と日替わりの単語を選び、プレビューを確認して、ページに埋め込むコードをコピーできます。",name:"「言葉」は英語のwordに当たる日本語です。",nameLink:"名前について",foot:"設定はリンクに入ります。回答や個人情報は保存しません。",toGallery:"単語のゲーム",makerGame:"単語のゲーム",makerGameSays:"英語、フランス語、ドイツ語、または日本語のかなで隠れた単語を当てます。",copyLink:"このゲームへのリンクをコピー",badDay:"実在する日付をYYYY-MM-DD形式で入力するか、todayまたはoffを指定してください。UTCの日付を使います。",badSettings:"アルファベットは4〜6文字、日本語のかなは3〜5文字を選んでください。"}};
const row=(id,kind,en,ja,extra={})=>({id,kind,group:"game",names:{game:id,mount:({letters:"size",lang:"locale"}[id]??id)},say:{en:{label:en[0],help:en[1]},ja:{label:ja[0],help:ja[1]}},...extra});
const options=[
row("words","choice",["Word list","English, French, German or Japanese kana."],["単語の一覧","英語、フランス語、ドイツ語、日本語のかなから選びます。"],{default:"en",choices:WORD_LIST_NAMES,choiceLabels:{ja:{en:"英語",fr:"フランス語",de:"ドイツ語",ja:"日本語のかな"}}}),
row("letters","choice",["Word length","4–6 letters or 3–5 kana."],["単語の長さ","アルファベットは4〜6文字、かなは3〜5文字です。"],{default:5,choices:[3,4,5,6]}),
row("rows","number",["Guesses","The number of guesses in a round."],["回答の回数","1回のゲームで答えられる回数です。"],{default:6,range:{min:1,max:12,step:1}}),
row("easy","boolean",["Easy words","Choose from the easy answers."],["易しい単語","易しい答えの中から選びます。"],{default:false}),
row("seed","number",["Seed","An optional whole number for the same hidden word."],["シード","同じ単語を選ぶための整数です。指定は任意です。"],{range:{min:0,max:4294967295,step:1}}),
row("daily","text",["Daily","A UTC date, today or off; daily takes priority over seed."],["日替わり","UTCの日付、today、offです。日替わりはシードより優先します。"]),
row("keyboard","boolean",["Keyboard","Use the device keyboard while this game is focused."],["キーボード","このゲームにフォーカスがある間、端末のキーボードを使います。"],{default:true}),
row("size","choice",["Display size","Small, medium or large."],["表示の大きさ","小・中・大を選びます。"],{default:"medium",choices:["small","medium","large"],names:{game:"size"}}),
row("width","number",["Width","Pixels, fitting a narrower parent."],["幅","ピクセルで指定します。狭い表示枠にも収まります。"],{range:{min:200,max:1000,step:10}}),
row("theme","choice",["Theme","Light, dark or the device's preference."],["配色","明るい配色・暗い配色、または端末の設定に合わせます。"],{default:"auto",choices:["auto","light","dark"],names:{game:"theme"}}),
row("lang","choice",["Language","The language of controls and prompts."],["読み上げる言語","操作ボタンと案内の言語です。"],{choices:["en","ja"]}),
row("label","text",["Spoken label","An optional screen-reader label."],["読み上げる名前","スクリーンリーダー用の名前です。指定は任意です。"]),
];
const leftOut={"mount.hidden":"A private host-selected word belongs to options.","mount.strings":"Host copy overrides belong to options.","mount.theme":"Custom CSS variables belong to options; the theme attribute selects light/dark/auto.","mount.keyboardTarget":"The element scopes keyboard events to its own focused game."};for(const name of["onChange","onFinish","load","now"])leftOut[`mount.${name}`]="Host callbacks, loaders and clocks belong to options.";
let mounted;const page=globalThis.familyLanguage({id:"kotoba",words,onChange:()=>{docsLink();mounted?.draw();}}),heights={};const key=settings=>JSON.stringify(settings);
function problem(settings){try{embedDay(settings.daily);}catch{return"badDay";}return WORD_LIST_SIZES[settings.words??"en"]?.includes(Number(settings.letters??5))?null:"badSettings";}
const builder=familyEmbedBuilder({id:"kotoba",packageName:"@johnmorrisdotca/kotoba",major:VERSION.split(".")[0],site:"https://johnmorrisdotca.github.io/kotoba/",title:"Kotoba · word game",titleJa:"単語ゲームの埋め込み",options,leftOut,groups:{game:{en:"The word game",ja:"単語ゲームの設定"}},makers:{game:{names:"game",element:"game",tag:"kotoba-game",embed:"embed/",required:["words","letters","size"],description:"makerGameSays",formats:["element","iframe","module","react","vue","svelte","angular","html","url"],width:640,height:settings=>heights[key(settings)]??1300}},code:({maker,format,settings})=>{if(problem(settings)!==null)return null;if((format==="iframe"||format==="url")&&settings.lang===undefined)return builder.codeFor(maker,format,options,{...settings,lang:page.lang});return undefined;}});
builder.validateCoverage({game:KotobaGame.observedAttributes,mount:KOTOBA_EMBED_OPTION_KEYS});
mounted=builder.mount({words,language:()=>page,initial:{game:{words:"en",letters:5,size:"medium",lang:page.lang}},renderPreview:({stage,attrs,settings,note,say})=>{if(problem(settings)!==null){note.textContent=say(problem(settings));return{destroy(){}};}const game=globalThis.document.createElement("kotoba-game");for(const[name,value]of attrs)game.setAttribute(name,value);game.addEventListener("kotoba-load",()=>{heights[key(settings)]=Math.ceil(game.getBoundingClientRect().height)+180;mounted?.refreshCode();});stage.append(game);return{destroy(){game.remove();}};}});

function docsLink(){document.querySelector('[data-say="pageDocs"]')?.setAttribute("href",page.lang==="ja"?"docs/ja/index.html":"docs/index.html");}
docsLink();
