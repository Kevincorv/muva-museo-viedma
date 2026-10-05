const fs=require("fs"),zlib=require("zlib");
function decodePNG(buf){let pos=8,w,h,bd,ct;const idat=[];
 while(pos<buf.length){const len=buf.readUInt32BE(pos);const type=buf.toString("ascii",pos+4,pos+8);const d=buf.subarray(pos+8,pos+8+len);
 if(type==="IHDR"){w=d.readUInt32BE(0);h=d.readUInt32BE(4);bd=d[8];ct=d[9];}
 else if(type==="IDAT")idat.push(d); else if(type==="IEND")break; pos+=12+len;}
 const ch={0:1,2:3,4:2,6:4}[ct]; if(bd!==8||!ch) throw new Error("unsupported "+bd+"/"+ct);
 const raw=zlib.inflateSync(Buffer.concat(idat)); const stride=w*ch; const out=Buffer.alloc(stride*h); let p=0;
 for(let y=0;y<h;y++){const f=raw[p++];const line=raw.subarray(p,p+stride);p+=stride;
  const cur=out.subarray(y*stride,(y+1)*stride); const prev=y>0?out.subarray((y-1)*stride,y*stride):null;
  for(let i=0;i<stride;i++){const a=i>=ch?cur[i-ch]:0,b=prev?prev[i]:0,c=prev&&i>=ch?prev[i-ch]:0,x=line[i];let v;
   switch(f){case 0:v=x;break;case 1:v=x+a;break;case 2:v=x+b;break;case 3:v=x+((a+b)>>1);break;
   case 4:{const pa=Math.abs(b-c),pb=Math.abs(a-c),pc=Math.abs(a+b-2*c);const pr=pa<=pb&&pa<=pc?a:pb<=pc?b:c;v=x+pr;break;}default:v=x;}
   cur[i]=v&255;}}
 return {w,h,ch,data:out};}
const files=process.argv.slice(2);
for(const f of files){const img=decodePNG(fs.readFileSync(f));let sum=0,n=0,lit=0;
 for(let i=0;i<img.w*img.h;i++){const r=img.data[i*img.ch],g=img.data[i*img.ch+1],b=img.data[i*img.ch+2];
  const y=0.2126*r+0.7152*g+0.0722*b; sum+=y;n++; if(y>60)lit++;}
 console.log(`${f}: ${img.w}x${img.h} avgLuma=${(sum/n).toFixed(1)} litPx=${(100*lit/n).toFixed(1)}%`);}
