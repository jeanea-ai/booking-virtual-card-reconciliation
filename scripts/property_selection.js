"use strict";
const normalize=v=>String(v??"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
function matchProperties(properties,query){if(!Array.isArray(properties)||!properties.length)return{status:"none",matches:[]};if(!query)return properties.length===1?{status:"selected",matches:[properties[0]]}:{status:"choose",matches:properties};const q=normalize(query);const exact=properties.filter(p=>normalize(p.name)===q);if(exact.length===1)return{status:"selected",matches:exact};const partial=properties.filter(p=>normalize(p.name).includes(q));return partial.length===1?{status:"selected",matches:partial}:partial.length?{status:"ambiguous",matches:partial}:{status:"none",matches:properties};}
module.exports={matchProperties,normalize};
