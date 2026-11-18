import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{D as t,L as n,Rt as r,a as i,an as a,tt as o,vt as s,wt as c,xn as l,yt as u}from"./vendor-react-BN7zgo-I.js";var d=e(l(),1);function f(e){if(!e)return{headers:[],rows:[]};let t=e.querySelector(`thead`),n=e.querySelector(`tbody`);if(!n)return{headers:[],rows:[]};let r=t?Array.from(t.querySelectorAll(`th`)):[],i=new Set,a=[];r.forEach((e,t)=>{let n=e.innerText.trim();!n||/^(action|actions|select|checkbox|#|\s*)$/i.test(n)&&e.querySelector(`input[type="checkbox"]`)?i.add(t):a.push(n)});let o=Array.from(n.querySelectorAll(`tr`)),s=[];return o.forEach(e=>{if(e.querySelector(`.animate-pulse`)||e.innerText.includes(`No records found`)||e.innerText.includes(`No data`))return;let t=Array.from(e.querySelectorAll(`td`));if(t.length===0)return;let n=[];t.forEach((e,t)=>{if(i.has(t))return;let r=e.innerText.replace(/\r?\n+/g,` `).replace(/\s+/g,` `).trim();n.push(r)}),n.length>0&&s.push(n)}),{headers:a,rows:s}}function p(e){if(e==null)return`""`;let t=String(e).trim();return t=t.replace(/"/g,`""`),`"${t}"`}function m({filename:e=`export`,title:t,columns:n,data:r,tableElement:i}){let a=[],o=[];if(r&&n)a=n.map(e=>typeof e==`string`?e:e.label||e.key),o=r.map(e=>n.map(t=>{let n=typeof t==`string`?t:t.key;return(typeof t.format==`function`?t.format(e[n],e):e[n])??``}));else if(i){let e=f(i);a=e.headers,o=e.rows}if(a.length===0&&o.length===0)throw Error(`No data available to export`);let s=[];t&&(s.push(`"${t.replace(/"/g,`""`)}"`),s.push(`"Exported on: ${new Date().toLocaleString()}"`),s.push(``)),s.push(a.map(p).join(`,`)),o.forEach(e=>{s.push(e.map(p).join(`,`))});let c=`﻿`+s.join(`\r
`);v(new Blob([c],{type:`text/csv;charset=utf-8;`}),`${y(e)}_${b()}.csv`)}function h({filename:e=`export`,title:t=`Report`,columns:n,data:r,tableElement:i}){let a=[],o=[];if(r&&n)a=n.map(e=>typeof e==`string`?e:e.label||e.key),o=r.map(e=>n.map(t=>{let n=typeof t==`string`?t:t.key;return(typeof t.format==`function`?t.format(e[n],e):e[n])??``}));else if(i){let e=f(i);a=e.headers,o=e.rows}if(a.length===0&&o.length===0)throw Error(`No data available to export`);let s=`
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>${x(t.slice(0,30))}</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
      <style>
        body { font-family: Calibri, Arial, sans-serif; }
        .title { font-size: 16pt; font-weight: bold; color: #225091; }
        .subtitle { font-size: 10pt; color: #666666; }
        th { background-color: #225091; color: #ffffff; font-weight: bold; padding: 8px 12px; border: 1px solid #1c4278; text-align: left; }
        td { padding: 6px 12px; border: 1px solid #e2e8f0; font-size: 10pt; }
        tr:nth-child(even) { background-color: #f8fafc; }
      </style>
    </head>
    <body>
      <table>
        <tr><td colspan="${a.length}" class="title">${x(t)}</td></tr>
        <tr><td colspan="${a.length}" class="subtitle">Generated: ${new Date().toLocaleString()} | Super Admin Portal</td></tr>
        <tr></tr>
        <thead>
          <tr>
            ${a.map(e=>`<th>${x(e)}</th>`).join(``)}
          </tr>
        </thead>
        <tbody>
          ${o.map(e=>`
            <tr>
              ${e.map(e=>`<td>${x(String(e??``))}</td>`).join(``)}
            </tr>
          `).join(``)}
        </tbody>
      </table>
    </body>
    </html>
  `;v(new Blob([s],{type:`application/vnd.ms-excel;charset=utf-8;`}),`${y(e)}_${b()}.xls`)}function g({title:e=`Report`,columns:t,data:n,tableElement:r}){let i=[],a=[];if(n&&t)i=t.map(e=>typeof e==`string`?e:e.label||e.key),a=n.map(e=>t.map(t=>{let n=typeof t==`string`?t:t.key;return(typeof t.format==`function`?t.format(e[n],e):e[n])??``}));else if(r){let e=f(r);i=e.headers,a=e.rows}if(i.length===0&&a.length===0)throw Error(`No data available to print`);let o=window.open(``,`_blank`);if(!o){alert(`Please allow popups to print reports`);return}let s=`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${x(e)} - Print View</title>
      <style>
        @page {
          size: landscape;
          margin: 12mm 15mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          color: #1a202c;
          margin: 0;
          padding: 20px;
          background: #fff;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-bottom: 2px solid #225091;
          padding-bottom: 12px;
          margin-bottom: 18px;
        }
        .org-name {
          font-size: 18px;
          font-weight: 800;
          color: #225091;
          letter-spacing: -0.02em;
        }
        .report-title {
          font-size: 14px;
          font-weight: 600;
          color: #4a5568;
          margin-top: 4px;
        }
        .meta {
          text-align: right;
          font-size: 11px;
          color: #718096;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }
        th {
          background-color: #f1f5f9;
          color: #1e293b;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.05em;
          padding: 8px 10px;
          border: 1px solid #cbd5e1;
          text-align: left;
        }
        td {
          padding: 7px 10px;
          border: 1px solid #e2e8f0;
          color: #334155;
        }
        tr:nth-child(even) {
          background-color: #f8fafc;
        }
        .footer {
          margin-top: 20px;
          font-size: 10px;
          color: #94a3b8;
          text-align: center;
          border-top: 1px solid #e2e8f0;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="org-name">Super Admin Portal</div>
          <div class="report-title">${x(e)}</div>
        </div>
        <div class="meta">
          <div><strong>Printed:</strong> ${new Date().toLocaleString()}</div>
          <div><strong>Total Records:</strong> ${a.length}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            ${i.map(e=>`<th>${x(e)}</th>`).join(``)}
          </tr>
        </thead>
        <tbody>
          ${a.map(e=>`
            <tr>
              ${e.map(e=>`<td>${x(String(e??``))}</td>`).join(``)}
            </tr>
          `).join(``)}
        </tbody>
      </table>

      <div class="footer">
        Generated from Super Admin Portal &bull; Confidential &bull; Page 1 of 1
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      <\/script>
    </body>
    </html>
  `;o.document.open(),o.document.write(s),o.document.close()}function _(e){g(e)}function v(e,t){let n=URL.createObjectURL(e),r=document.createElement(`a`);r.setAttribute(`href`,n),r.setAttribute(`download`,t),r.style.visibility=`hidden`,document.body.appendChild(r),r.click(),document.body.removeChild(r),URL.revokeObjectURL(n)}function y(e){return String(e).toLowerCase().replace(/[^\w\s-]/g,``).replace(/[\s_-]+/g,`_`).replace(/^-+|-+$/g,``)}function b(){let e=new Date;return`${e.getFullYear()}${String(e.getMonth()+1).padStart(2,`0`)}${String(e.getDate()).padStart(2,`0`)}`}function x(e){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&apos;`)}var S=a();function C({title:e=`Report`,filename:a=`report`,tableRef:l,data:f,columns:p,className:v=``,buttonText:y=`Export`}){let[b,x]=(0,d.useState)(!1),[C,w]=(0,d.useState)(null),T=(0,d.useRef)(null);(0,d.useEffect)(()=>{function e(e){T.current&&!T.current.contains(e.target)&&x(!1)}return document.addEventListener(`mousedown`,e),()=>document.removeEventListener(`mousedown`,e)},[]);let E=async t=>{x(!1),w(t);try{let n={title:e,filename:a,data:f,columns:p,tableElement:l?.current};t===`csv`?(m(n),i.success(`CSV downloaded successfully`)):t===`excel`?(h(n),i.success(`Excel file downloaded successfully`)):t===`pdf`?_(n):t===`print`&&g(n)}catch(e){console.error(`Export error:`,e),i.error(e.message||`Failed to export table data`)}finally{setTimeout(()=>w(null),500)}};return(0,S.jsxs)(`div`,{className:`relative inline-block text-left ${v}`,ref:T,children:[(0,S.jsxs)(`button`,{type:`button`,onClick:()=>x(!b),disabled:!!C,className:`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-[#225091]/5 hover:border-[#225091]/40 text-gray-700 hover:text-[#225091] text-xs font-semibold shadow-2xs transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#225091]/20 active:scale-95 disabled:opacity-50`,title:`Export options: PDF, Excel, CSV, Print`,children:[C?(0,S.jsx)(o,{size:15,className:`animate-spin text-[#225091]`}):(0,S.jsx)(c,{size:15,className:`text-[#225091] shrink-0`}),(0,S.jsx)(`span`,{children:C?`Exporting ${C.toUpperCase()}...`:y}),(0,S.jsx)(r,{size:14,className:`text-gray-400 transition-transform duration-200 ${b?`rotate-180 text-[#225091]`:``}`})]}),b&&(0,S.jsxs)(`div`,{className:`absolute right-0 mt-1.5 w-52 rounded-xl bg-white shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150`,children:[(0,S.jsx)(`div`,{className:`px-3 py-1.5 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider`,children:`Available Export Formats`}),(0,S.jsxs)(`button`,{type:`button`,onClick:()=>E(`pdf`),className:`w-full text-left px-3.5 py-2.5 text-xs text-gray-700 hover:bg-[#225091]/5 hover:text-[#225091] flex items-center gap-2.5 transition-colors cursor-pointer group`,children:[(0,S.jsx)(`div`,{className:`w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:bg-rose-100`,children:(0,S.jsx)(s,{size:14})}),(0,S.jsxs)(`div`,{className:`flex flex-col`,children:[(0,S.jsx)(`span`,{className:`font-semibold text-gray-800 group-hover:text-[#225091]`,children:`PDF Document`}),(0,S.jsx)(`span`,{className:`text-[10px] text-gray-400`,children:`Formatted printable PDF`})]})]}),(0,S.jsxs)(`button`,{type:`button`,onClick:()=>E(`excel`),className:`w-full text-left px-3.5 py-2.5 text-xs text-gray-700 hover:bg-[#225091]/5 hover:text-[#225091] flex items-center gap-2.5 transition-colors cursor-pointer group`,children:[(0,S.jsx)(`div`,{className:`w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-100`,children:(0,S.jsx)(t,{size:14})}),(0,S.jsxs)(`div`,{className:`flex flex-col`,children:[(0,S.jsx)(`span`,{className:`font-semibold text-gray-800 group-hover:text-[#225091]`,children:`Excel Spreadsheet`}),(0,S.jsx)(`span`,{className:`text-[10px] text-gray-400`,children:`.xls / .xlsx workbook`})]})]}),(0,S.jsxs)(`button`,{type:`button`,onClick:()=>E(`csv`),className:`w-full text-left px-3.5 py-2.5 text-xs text-gray-700 hover:bg-[#225091]/5 hover:text-[#225091] flex items-center gap-2.5 transition-colors cursor-pointer group`,children:[(0,S.jsx)(`div`,{className:`w-6 h-6 rounded-lg bg-blue-50 text-[#225091] flex items-center justify-center shrink-0 group-hover:bg-blue-100`,children:(0,S.jsx)(u,{size:14})}),(0,S.jsxs)(`div`,{className:`flex flex-col`,children:[(0,S.jsx)(`span`,{className:`font-semibold text-gray-800 group-hover:text-[#225091]`,children:`CSV File`}),(0,S.jsx)(`span`,{className:`text-[10px] text-gray-400`,children:`Comma-separated values`})]})]}),(0,S.jsx)(`div`,{className:`my-1 border-t border-gray-100`}),(0,S.jsxs)(`button`,{type:`button`,onClick:()=>E(`print`),className:`w-full text-left px-3.5 py-2.5 text-xs text-gray-700 hover:bg-[#225091]/5 hover:text-[#225091] flex items-center gap-2.5 transition-colors cursor-pointer group`,children:[(0,S.jsx)(`div`,{className:`w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-100`,children:(0,S.jsx)(n,{size:14})}),(0,S.jsxs)(`div`,{className:`flex flex-col`,children:[(0,S.jsx)(`span`,{className:`font-semibold text-gray-800 group-hover:text-[#225091]`,children:`Print Table`}),(0,S.jsx)(`span`,{className:`text-[10px] text-gray-400`,children:`Direct print layout`})]})]})]})]})}export{C as t};