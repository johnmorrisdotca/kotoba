/** Preserve checked public examples in generated word lists without changing their data or notices. */
import {readFileSync,writeFileSync as writeRaw} from "node:fs";
import {basename,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import process from "node:process";
const entries={"words-en.data.ts":"words-en","words-fr.data.ts":"words-fr","words-de.data.ts":"words-de","pop-answers.data.ts":"pop-answers","pop-guesses.data.ts":"pop-guesses","kana-3.data.ts":"kana-3","kana-4.data.ts":"kana-4","kana-5.data.ts":"kana-5"};
export function withWordExamples(text,entry){
 const edits=[];
 for(const match of text.matchAll(/^export const (\w+)/gm)){
  const start=match.index,name=match[1],end=text.lastIndexOf("*/",start)+2,pos=text.lastIndexOf("/**",end);
  const doc=pos>=0&&end>1&&/^\s*$/.test(text.slice(end,start))?{pos,end}:null;
  if(doc&&text.slice(doc.pos,doc.end).includes("@example"))continue;
  let comment=doc?text.slice(doc.pos,doc.end).replace(/\s*\*\/$/,""):"/** Pop-culture answer words, grouped by word length.\n *";
  const value=name==="POP_CATEGORIES"?name:`Object.keys(${name})`;
  comment+="\n *\n * @example\n * ```ts\n * import { "+name+" } from \"@johnmorrisdotca/kotoba/"+entry+"\";\n * console.log("+value+");\n * ```\n */";
  edits.push({start:doc?.pos??start,end:doc?.end??start,text:comment+(doc?"":"\n")});
 }
 for(const e of edits.sort((a,b)=>b.start-a.start))text=text.slice(0,e.start)+e.text+text.slice(e.end);
 return text;
}
/** Write the existing dictionary output with its checked import examples. Other targets are passed through. */
export function writeWordList(file,text,...options){
 const entry=entries[basename(file instanceof URL?fileURLToPath(file):file)];
 return writeRaw(file,entry?withWordExamples(text,entry):text,...options);
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)&&process.argv.includes("--refresh")){
 for(const[file,entry]of Object.entries(entries)){
  const target="src/lists/"+file,before=readFileSync(target,"utf8"),after=withWordExamples(before,entry);
  if(before!==after)writeRaw(target,after);
  console.log(target);
 }
}
