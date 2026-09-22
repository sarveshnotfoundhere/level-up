export default async function handler(req,res){
  if(req.method!=="GET")return res.status(405).json({error:"Method not allowed"});
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),12000);
  const quoteSymbols=["GC=F","CL=F","BZ=F","^GSPC","^IXIC","^DJI","^FTSE","^N225","BTC-USD","EURUSD=X","JPY=X","INR=X"];
  const meta={
    "GC=F":["GOLD","COMMODITY","USD / TROY OZ"],"CL=F":["WTI OIL","COMMODITY","USD / BARREL"],"BZ=F":["BRENT OIL","COMMODITY","USD / BARREL"],
    "^GSPC":["S&P 500","INDEX","INDEX"],"^IXIC":["NASDAQ","INDEX","INDEX"],"^DJI":["DOW JONES","INDEX","INDEX"],"^FTSE":["FTSE 100","INDEX","INDEX"],"^N225":["NIKKEI 225","INDEX","INDEX"],
    "BTC-USD":["BITCOIN","DIGITAL ASSET","USD"],"EURUSD=X":["EUR / USD","FX","RATE"],"JPY=X":["USD / JPY","FX","RATE"],"INR=X":["USD / INR","FX","RATE"]
  };
  const currencies=[
    ["USD","US DOLLAR","United States","USDINR=X"],["EUR","EURO","Euro Area","EURINR=X"],["JPY","JAPANESE YEN","Japan","JPYINR=X"],["GBP","POUND STERLING","United Kingdom","GBPINR=X"],
    ["CNY","YUAN","China","CNYINR=X"],["CHF","SWISS FRANC","Switzerland","CHFINR=X"],["INR","INDIAN RUPEE","India","INR=X"],["KRW","SOUTH KOREAN WON","South Korea","KRWINR=X"],
    ["CAD","CANADIAN DOLLAR","Canada","CADINR=X"],["AUD","AUSTRALIAN DOLLAR","Australia","AUDINR=X"]
  ];
  try{
    async function fetchQuote(symbol){
      const url="https://query1.finance.yahoo.com/v8/finance/chart/"+encodeURIComponent(symbol)+"?range=1d&interval=5m";
      const r=await fetch(url,{headers:{"User-Agent":"Mozilla/5.0","Accept":"application/json"},signal:controller.signal,cache:"no-store"});
      if(!r.ok)throw new Error("Quote request failed");
      const data=await r.json();
      const m=data?.chart?.result?.[0]?.meta;
      if(!m||typeof m.regularMarketPrice!=="number")throw new Error("Quote unavailable");
      const previous=typeof m.chartPreviousClose==="number"?m.chartPreviousClose:typeof m.previousClose==="number"?m.previousClose:null;
      return {price:m.regularMarketPrice,changePct:previous?((m.regularMarketPrice-previous)/previous)*100:0,currency:m.currency,time:m.regularMarketTime};
    }
    const marketResults=await Promise.all(quoteSymbols.map(async symbol=>{
      const q=await fetchQuote(symbol),m=meta[symbol];
      let price;
      if(symbol==="BTC-USD")price="$"+q.price.toLocaleString("en-US",{maximumFractionDigits:0});
      else if(symbol.includes("=F"))price="$"+q.price.toFixed(2);
      else price=q.price.toLocaleString("en-US",{maximumFractionDigits:2});
      return {symbol,name:m[0],type:m[1],suffix:m[2],price,changePct:q.changePct,time:q.time?new Date(q.time*1000).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",timeZone:"Asia/Kolkata"}):"—"};
    }));
    const currencyResults=await Promise.all(currencies.map(async ([code,name,country,symbol])=>{
      if(code==="USD")return {code,name,country,rate:"1.0000 USD",changePct:0};
      const q=await fetchQuote(symbol);
      return {code,name,country,rate:q.price.toFixed(code==="JPY"?2:4)+" INR per "+code,changePct:q.changePct};
    }));
    return res.status(200).setHeader("Cache-Control","no-store").json({updatedAt:new Date().toISOString(),currencies:currencyResults,markets:marketResults});
  }catch(error){
    return res.status(502).json({error:error?.name==="AbortError"?"Market data timed out":(error?.message||"Market data error")});
  }finally{clearTimeout(timeout);}
}
