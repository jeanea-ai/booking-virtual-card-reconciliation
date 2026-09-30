#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const { validateRunContext, validateExtractedPage, validateReconciliationResult } = require("./generated/validators");
const clean = (v) => String(v ?? "").replace(/\s+/g, " ").trim();
function errors(v){ return (v.errors||[]).map(e=>`${e.instancePath||"/"} ${e.message}`).join("; "); }
function reconcile(pages, context) {
  if (!validateRunContext(context)) throw new Error(`Invalid run context: ${errors(validateRunContext)}`);
  if (!Array.isArray(pages) || !pages.length) throw new Error("At least one extracted page is required");
  if (pages.length > 200) throw new Error("Page limit exceeded");
  const sections = new Set(), totals = {}, records = [], skippedRecords = [], skippedPages = [], warnings = [], signatures = new Set(), lastPage = {};
  for (const page of pages) {
    if (!validateExtractedPage(page)) throw new Error(`Invalid extracted page: ${errors(validateExtractedPage)}`);
    if (page.property.id !== context.expectedProperty.id) throw new Error(`Property mismatch on ${page.section} page ${page.pageNumber}`);
    if (page.property.name.toLowerCase() !== context.expectedProperty.name.toLowerCase()) throw new Error(`Property name mismatch on ${page.section} page ${page.pageNumber}`);
    const expectedPage = (lastPage[page.section] || 0) + 1;
    if (page.pageNumber !== expectedPage) throw new Error(`Unexpected page order for ${page.section}: expected ${expectedPage}, got ${page.pageNumber}`);
    lastPage[page.section] = page.pageNumber;
    const key = `${page.section}:${page.pagination.signature}`;
    if (signatures.has(key)) throw new Error(`Repeated page detected: ${key}`);
    signatures.add(key); sections.add(page.section);
    if (totals[page.section] && totals[page.section] !== page.displayedTotal) throw new Error(`Displayed total changed in ${page.section}`);
    totals[page.section] = page.displayedTotal;
    if (page.status === "page_skipped") skippedPages.push({section:page.section,page:page.pageNumber,error:clean(page.warnings.join("; "))||"Unreadable after one retry"});
    records.push(...page.records.map(r=>({...r,section:page.section,sourcePage:page.pageNumber})));
    skippedRecords.push(...page.skippedRecords.map(r=>({section:page.section,page:page.pageNumber,...r})));
    warnings.push(...page.warnings.map(w=>`${page.section} page ${page.pageNumber}: ${clean(w)}`));
  }
  for (const section of ["ready_to_charge","refund_due"]) {
    if (!sections.has(section)) throw new Error(`Missing required section: ${section}`);
    if (!totals[section]) throw new Error(`Booking.com displayed total is required for ${section}`);
  }
  const result = {schemaVersion:"1.0.0",runId:context.runId,generatedAt:context.generatedAt,timezone:context.timezone,skillVersion:context.skillVersion,property:context.expectedProperty,status:(skippedRecords.length||skippedPages.length)?"complete_with_skips":"complete",officialTotals:{ready_to_charge:totals.ready_to_charge,refund_due:totals.refund_due},records,skippedRecords,skippedPages,warnings};
  if (!validateReconciliationResult(result)) throw new Error(`Invalid reconciliation result: ${errors(validateReconciliationResult)}`);
  return result;
}
module.exports={reconcile};
if(require.main===module){try{const [p,c,o]=process.argv.slice(2);if(!p||!c||!o)throw new Error("Usage: reconcile.js <pages.json> <run-context.json> <result.json>");const result=reconcile(JSON.parse(fs.readFileSync(p,"utf8")),JSON.parse(fs.readFileSync(c,"utf8")));fs.writeFileSync(o,JSON.stringify(result,null,2),{mode:0o600});process.stdout.write(JSON.stringify({status:result.status,records:result.records.length,skippedRecords:result.skippedRecords.length,skippedPages:result.skippedPages.length})+"\n");}catch(e){process.stderr.write(`Reconciliation failed: ${e.message}\n`);process.exit(1);}}
