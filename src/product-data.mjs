import games from '../public/data/games-web-build.json' with {type:'json'};
export const gameRoutes={longbow:'/play/longbow/','grand-prix-dash':'/play/rally/',yorker:'/play/yorker/','hoop-legacy':'/play/hoop-legacy/'};
export const productRows=games.selectedGames.flatMap(game=>[
 ['Game ID',game.id],['Title',game.title],['Sport',game.sport],['App route',gameRoutes[game.id]],['Runtime version',game.runtimeVersion],['Host protocol',game.hostProtocol],['Save schema',game.saveSchema],['Artifact bytes',game.bytes],['Accepted SHA-256',game.sha256]
].map(([label,value])=>({id:game.id+'-'+label,category:game.title,label,value,status:'Actual product build',source:'Accepted game catalogue '+games.catalogueRevision})));
productRows.push({id:'viewport-width',category:'Presentation',label:'Landscape viewport width',value:games.viewport.width,status:'Actual product build',source:'Case-study device frame'},{id:'viewport-height',category:'Presentation',label:'Landscape viewport height',value:games.viewport.height,status:'Actual product build',source:'Case-study device frame'});
export function productCSV(){const keys=['id','category','label','value','status','source'],esc=value=>'"'+String(value??'').replaceAll('"','""')+'"';return '\uFEFF'+[keys.join(','),...productRows.map(row=>keys.map(key=>esc(row[key])).join(','))].join('\r\n');}
