/* IVÍM Weight Loss Efficiency – aggregate data only, no credentials, no API calls. */
(() => {
  'use strict';
  const STORAGE_KEY = 'ivim_weight_loss_aggregate_v1';
  const FIELDS = ['spend','impressions','clicks','registrations','scheduled','attended','first_purchases','revenue'];
  const state = {rows:[], demo:true,channel:'all',period:'14',grain:'campaign',search:'',selection:null,chartMetric:'cpr'};
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const n = (v) => {if(v===null||v===undefined||String(v).trim()==='')return null; const x=Number(String(v).replace(/[$,%\s,]/g,'').replace(/^\((.*)\)$/,'-$1'));return Number.isFinite(x)?x:null};
  const money = v => v===null||!Number.isFinite(v)?'—':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:Math.abs(v)>=1000?0:2}).format(v);
  const count = v => v===null||!Number.isFinite(v)?'—':new Intl.NumberFormat('en-US',{maximumFractionDigits:v%1===0?0:1}).format(v);
  const pct = v => v===null||!Number.isFinite(v)?'—':(v*100).toFixed(1)+'%';
  const ratio = (a,b)=>a===null||b===null||b<=0?null:a/b;
  const has = (r,k)=>r[k]!==null&&r[k]!==undefined&&Number.isFinite(r[k]);
  const numOrNull=(x)=>x===null?null:Number(x);
  const isoDay = v => {
    const s=String(v||'').trim();if(!s)return null;
    const m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:\s|T|$)/);if(m){const d=`${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`;return validDate(d)?d:null;}
    const us=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);if(us){const d=`${us[3]}-${us[1].padStart(2,'0')}-${us[2].padStart(2,'0')}`;return validDate(d)?d:null;}
    const ts=Date.parse(s+' 12:00 UTC');if(Number.isFinite(ts))return new Date(ts).toISOString().slice(0,10);return null;
  };
  const validDate = s => Number.isFinite(Date.parse(s+'T12:00:00Z')) && new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
  const addDays = (d,n)=>new Date(Date.parse(d+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
  const prettyDate=(d,year=false)=>d?new Date(d+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',...(year?{year:'numeric'}:{})}):'—';
  function demoData(){
    const rows=[];const names=['Demo · Brand / Weight Loss','Demo · High Intent Search A','Demo · High Intent Search B'];
    for(let i=0;i<30;i++){const d=addDays('2026-09-25',i);for(let j=0;j<3;j++){
      const spend=Math.round((320+j*160)+(Math.sin(i*1.29+j)*46)+(i>20?-(j+1)*26:0));
      const regs=Math.max(2,Math.round(spend/(j===0?66:j===1?103:126)*(1+Math.sin((i+j)*.66)*.12)));
      const scheduled=Math.round(regs*(.38+j*.018));const attended=Math.round(scheduled*.67);
      rows.push({date:d,platform:'Google Ads',campaign:names[j],ad_group:'',ad:'',spend,impressions:Math.round(spend*43),clicks:Math.round(spend*1.9),registrations:regs,scheduled,attended,first_purchases:Math.round(attended*.21),revenue:Math.round(attended*.21*280)});
    }}return rows;
  }
  function store(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state.rows))}catch(e){console.warn('Browser storage unavailable',e)}}
  function bootstrap(){try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(Array.isArray(saved)&&saved.length){state.rows=saved.filter(r=>validDate(r.date)&&r.platform&&r.campaign);state.demo=false;}else{state.rows=demoData();state.demo=true}}catch(_){state.rows=demoData();state.demo=true;}render()}
  function aggregate(rows){const o={count:rows.length};FIELDS.forEach(k=>{const valid=rows.filter(r=>has(r,k));o[k]=valid.length?valid.reduce((a,r)=>a+r[k],0):null;o[k+'_coverage']=rows.length?valid.length/rows.length:0});return o}
  function subset(){const all=state.rows.filter(r=>state.channel==='all'||r.platform===state.channel);if(!all.length)return {all:[],current:[],previous:[],start:null,end:null};const end=all.map(r=>r.date).sort().at(-1);const days=state.period==='all'?null:Number(state.period);const start=days===null?all.map(r=>r.date).sort()[0]:addDays(end,1-days);const previousEnd=addDays(start,-1);const previousStart=days===null?null:addDays(previousEnd,1-days);
    const isSelected=r=>!state.selection||r[state.grain]===state.selection;
    const curr=all.filter(r=>r.date>=start&&r.date<=end&&isSelected(r));const prev=days===null?[]:all.filter(r=>r.date>=previousStart&&r.date<=previousEnd&&isSelected(r));
    return {all,current:curr,previous:prev,start,end,previousStart,previousEnd,days};
  }
  function kpi(a){return {cpr:ratio(a.spend,a.registrations),cps:ratio(a.spend,a.scheduled),cpa:ratio(a.spend,a.first_purchases),show:ratio(a.attended,a.scheduled),regRate:ratio(a.registrations,a.clicks),ctr:ratio(a.clicks,a.impressions)}}
  function change(c,p,inverse=false){if(c===null||p===null||p===0)return {str:'No baseline',type:'neutral',relative:null};const diff=(c/p-1);return {str:(diff>0?'+':'')+(diff*100).toFixed(1)+'%',relative:diff,type:Math.abs(diff)<.025?'neutral':((diff<0)===inverse?'bad':'good')};}
  // inverse=true means lower is better (e.g. cost); lower => good.
  function movement(c,p,lowerBetter){const a=change(c,p);if(a.relative!==null&&Math.abs(a.relative)>=.025)a.type=(lowerBetter?a.relative<0:a.relative>0)?'good':'bad';return a}
  function cell(v,formatter=count){return formatter(v)}
  function render(){const x=subset(),a=aggregate(x.current),b=aggregate(x.previous),ka=kpi(a),kb=kpi(b);const isLive=!state.demo;
    $('data-mode').textContent=isLive?'IMPORTED DATA':'DEMO DATA';$('data-mode').className='data-mode'+(isLive?' live':'');
    $('last-updated').textContent='Latest available: '+prettyDate(x.end,true);$('date-range').textContent=x.start?`${prettyDate(x.start)} – ${prettyDate(x.end,true)}`:'No data';
    $('notice-title').textContent=isLive?'Imported aggregate data':'Synthetic demonstration';$('notice-body').textContent=isLive?'This dashboard refreshes when you import new daily reports; it is not connected to live ad or IVIM APIs.':'All displayed figures are illustrative, not actual IVIM results. Import real daily data before using any conclusions.';
    $('status-text').textContent=isLive?'Manual CSV · not live':'No live connection';
    ['Google Ads','Meta Ads'].forEach((p,i)=>{$(i===0?'google-state':'meta-state').textContent=isLive&&state.rows.some(r=>r.platform===p)?'Imported':'Not connected'});
    $('crm-state').textContent=isLive&&state.rows.some(r=>has(r,'scheduled')||has(r,'attended')||has(r,'first_purchases'))?'CSV fields':'Not connected';
    const cards=[
      {label:'Media spend',v:money(a.spend),change:movement(a.spend,b.spend,true),footer:'vs previous period'},
      {label:'Registrations',v:count(a.registrations),change:movement(a.registrations,b.registrations,false),footer:'platform attributed'},
      {label:'Blended CPR',v:money(ka.cpr),change:movement(ka.cpr,kb.cpr,true),footer:'spend / registrations',highlight:true},
      {label:'Scheduled appointments',v:count(a.scheduled),change:movement(a.scheduled,b.scheduled,false),footer:'source definition required'},
      {label:'Appointment show rate',v:pct(ka.show),change:movement(ka.show,kb.show,false),footer:'attended / scheduled'},
      {label:'Cost / first purchase',v:money(ka.cpa),change:movement(ka.cpa,kb.cpa,true),footer:'spend / first purchases'}
    ];
    $('kpi-grid').innerHTML=cards.map(c=>`<article class="kpi-card ${c.highlight?'highlight':''}"><div class="kpi-label">${c.label}</div><div class="kpi-value">${c.v}</div><div class="kpi-meta ${c.highlight?'':c.change.type==='good'?'positive':c.change.type==='bad'?'negative':''}">${c.change.str} ${c.footer}</div></article>`).join('');
    const uniqueDays=new Set(x.current.map(r=>r.date)).size;const periodDays=x.days|| (x.start&&x.end?Math.round((Date.parse(x.end)-Date.parse(x.start))/86400000)+1:0);
    $('data-coverage').textContent=`Data coverage: ${uniqueDays} / ${periodDays} dates`;
    renderChart(x);renderComparison(a,b);renderJourney(a);renderCampaignTable(x);renderAlerts(a,b,x);
  }
  function renderComparison(a,b){const ka=kpi(a),kb=kpi(b);const specs=[{name:'Blended CPR',curr:ka.cpr,prev:kb.cpr,fmt:money,betterLow:true},{name:'Registration volume',curr:a.registrations,prev:b.registrations,fmt:count,betterLow:false},{name:'Cost per scheduled',curr:ka.cps,prev:kb.cps,fmt:money,betterLow:true},{name:'First purchase volume',curr:a.first_purchases,prev:b.first_purchases,fmt:count,betterLow:false}];
    $('comparison').innerHTML=specs.map(s=>{const m=movement(s.curr,s.prev,s.betterLow);return `<div class="compare-row"><div class="compare-row-title"><b>${s.name}</b><span>Previous: ${s.fmt(s.prev)}</span></div><div class="compare-values"><strong>${s.fmt(s.curr)}</strong><span class="delta ${m.type}">${m.str}</span></div></div>`}).join('');
  }
  function renderJourney(a){const steps=[{name:'Ad clicks',k:'clicks',sub:'Paid platform traffic'},{name:'Registrations',k:'registrations',sub:'Attributed event count'},{name:'Scheduled',k:'scheduled',sub:'IVIM / offline goal'},{name:'Attended',k:'attended',sub:'Completed appointments'},{name:'First purchase',k:'first_purchases',sub:'Not return purchases'}];$('journey-grid').innerHTML=steps.map((s,i)=>{const prev=steps[i-1];const val=a[s.k],p=prev?a[prev.k]:null;const r=i?ratio(val,p):null;const known=r!==null;return `<div class="journey-stage"><div class="journey-title">${s.name}</div><div class="journey-value">${count(val)}</div><div class="journey-rate ${known?'':'unknown'}">${i===0?'Entry volume':known?pct(r)+' of prior stage · directional':'Conversion unknown / not matched'}</div></div>`}).join('')}
  function valueFor(a,key){const k=kpi(a);return key==='spend'?a.spend:key==='registrations'?a.registrations:k[key]}
  function renderChart(x){const dates=[];if(!x.start||!x.end){$('trend-chart').innerHTML='<div class="chart-placeholder">No matching data</div>';return;}for(let date=x.start;date<=x.end;date=addDays(date,1)){dates.push(date);if(dates.length>=366)break}if(!dates.length){$('trend-chart').innerHTML='<div class="chart-placeholder">No matching data</div>';return}
    const series=dates.map(date=>({date,value:valueFor(aggregate(x.current.filter(r=>r.date===date)),state.chartMetric)}));const vals=series.map(d=>d.value).filter(v=>v!==null&&Number.isFinite(v));
    $('metric-legend').textContent=($('chart-metric').selectedOptions[0]||{}).textContent||'Daily efficiency';
    if(!vals.length){$('trend-chart').innerHTML='<div class="chart-placeholder">No valid metric values in this period</div>';return}
    const W=800,H=280,L=65,R=17,T=15,B=35;const high=Math.max(...vals)*1.15||1;const low=0;const xx=i=>L+(i/Math.max(1,series.length-1))*(W-L-R);const yy=v=>T+((high-v)/(high-low))*(H-T-B);const format=state.chartMetric==='spend'||['cpr','cps','cpa'].includes(state.chartMetric)?money:count;
    let path='',areas=[];let last=false;series.forEach((d,i)=>{if(d.value===null){last=false;return;}const px=xx(i),py=yy(d.value);path+=`${last?'L':'M'}${px.toFixed(1)},${py.toFixed(1)} `;last=true});
    const ylines=[0,.25,.5,.75,1].map(f=>{const y=T+(H-T-B)*f;return `<line class="gridline" x1="${L}" x2="${W-R}" y1="${y}" y2="${y}"/><text x="${L-12}" y="${y+4}" text-anchor="end">${esc(format(high*(1-f)))}</text>`}).join('');
    const ticks=[0,Math.floor((dates.length-1)/4),Math.floor((dates.length-1)/2),Math.floor((dates.length-1)*.75),dates.length-1].filter((v,i,arr)=>arr.indexOf(v)===i).map(i=>`<text x="${xx(i)}" y="${H-8}" text-anchor="middle">${prettyDate(dates[i])}</text>`).join('');
    const points=series.map((d,i)=>d.value===null?'':`<circle class="point" cx="${xx(i)}" cy="${yy(d.value)}" r="3.4"><title>${prettyDate(d.date,true)}: ${format(d.value)}</title></circle>`).join('');
    const mark=dates.indexOf('2026-10-15');const annotation=mark>=0?`<line class="annotation" x1="${xx(mark)}" x2="${xx(mark)}" y1="${T}" y2="${H-B}"/><text x="${Math.min(xx(mark)+5,W-125)}" y="${T+12}" fill="#77977d">Oct 15 change window</text>`:'';
    $('trend-chart').innerHTML=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Daily ${esc(state.chartMetric)} chart for ${esc(prettyDate(x.start))} to ${esc(prettyDate(x.end))}"><defs><linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#52b3a0" stop-opacity=".17"/><stop offset="100%" stop-color="#52b3a0" stop-opacity="0"/></linearGradient></defs>${ylines}${ticks}${annotation}<path d="${path}" class="line"/>${points}</svg>`;
  }
  function grouped(rows){const map=new Map();rows.forEach(r=>{const key=String(r[state.grain]||'(not specified)')+'|'+r.platform;let g=map.get(key);if(!g){g={name:r[state.grain]||'(not specified)',platform:r.platform,rows:[]};map.set(key,g)}g.rows.push(r)});return [...map.values()].map(v=>({...v,a:aggregate(v.rows)})).sort((a,b)=>(b.a.spend||0)-(a.a.spend||0))}
  function renderCampaignTable(x){const all=state.rows.filter(r=>(state.channel==='all'||r.platform===state.channel)&&r.date>=x.start&&r.date<=x.end);const groups=grouped(all).filter(g=>g.name.toLowerCase().includes(state.search)||g.platform.toLowerCase().includes(state.search));$('table-count').textContent=`${groups.length} segment${groups.length===1?'':'s'} · click a row to filter trends`;
    $('campaign-rows').innerHTML=groups.length?groups.map(g=>{const a=g.a,k=kpi(a);const flag=(k.cpr===null)?['missing','Data gap']:(k.cpr>180)?['bad','High CPR']:(k.cpr>125)?['warn','Review CPR']:['ok','Monitor'];return `<tr data-name="${esc(g.name)}" class="${state.selection===g.name?'selected':''}" tabindex="0"><td>${esc(g.name)}<small>${esc(g.platform)}</small></td><td>${money(a.spend)}</td><td>${count(a.registrations)}</td><td><b>${money(k.cpr)}</b></td><td>${count(a.scheduled)}</td><td>${count(a.attended)}</td><td>${count(a.first_purchases)}</td><td>${money(k.cpa)}</td><td><span class="signal-chip ${flag[0]}">${flag[1]}</span></td></tr>`}).join(''):'<tr><td colspan="9" style="text-align:center;padding:36px;color:#9aacae">No campaign data matches these filters.</td></tr>';
    $('campaign-rows').querySelectorAll('tr[data-name]').forEach(tr=>{const go=()=>{state.selection=state.selection===tr.dataset.name?null:tr.dataset.name;render()};tr.addEventListener('click',go);tr.addEventListener('keydown',e=>{if(e.key==='Enter')go()})});
  }
  function renderAlerts(a,b,x){const k=kpi(a),prev=kpi(b),alerts=[];if(!x.current.length)alerts.push({type:'warn',icon:'!',name:'No imported rows for the selection',details:'Change filters or import daily CSV exports.'});
    if(a.registrations===null)alerts.push({type:'warn',icon:'!',name:'Registration action not available',details:'Do not use generic Google Ads Conversions as Registered. Export the specific registration action.'});
    if(k.cpr!==null&&prev.cpr!==null&&k.cpr>prev.cpr*1.15)alerts.push({type:'bad',icon:'↑',name:'Registration cost increased more than 15%',details:`CPR is ${money(k.cpr)} vs ${money(prev.cpr)} previously. Audit search terms, bids, geography, devices and campaign mix.`});
    if(a.registrations!==null&&b.registrations!==null&&a.registrations<b.registrations*.8)alerts.push({type:'warn',icon:'↓',name:'Registration volume down more than 20%',details:`${count(a.registrations)} vs ${count(b.registrations)} previously. Confirm whether efficiency gains came from reduced volume.`});
    if(k.show!==null&&k.show<.6)alerts.push({type:'bad',icon:'!',name:'Appointment attendance below 60%',details:`Show rate ${pct(k.show)}. Validate cohort alignment, then review reminder cadence and patient intent.`});
    if(a.scheduled===null||a.attended===null||a.first_purchases===null)alerts.push({type:'warn',icon:'◎',name:'Downstream quality is not fully measured',details:'Add matched daily scheduled, attended and first-purchase data before asserting improvements in patient acquisition cost.'});
    const stale=x.end&&((Date.now()-Date.parse(x.end+'T23:59:59Z'))>3*86400000);if(stale&&!state.demo)alerts.push({type:'warn',icon:'◷',name:'Daily data appears stale',details:`Latest imported date is ${prettyDate(x.end,true)}. Import new rows to review daily decisions.`});
    if(!alerts.length)alerts.push({type:'ok',icon:'✓',name:'No rule-based exceptions for this period',details:'Keep monitoring daily CPR alongside registration volume, appointment attendance, and first purchases.'});
    if(state.demo)alerts.unshift({type:'warn',icon:'i',name:'These alerts use synthetic demonstration data',details:'Import real data to activate actual performance monitoring.'});
    $('alerts').innerHTML=alerts.slice(0,5).map(s=>`<div class="alert-item"><span class="alert-icon ${s.type==='ok'?'':s.type}">${s.icon}</span><div><b>${esc(s.name)}</b><p>${esc(s.details)}</p></div></div>`).join('');
  }
  function csvRows(csv){let out=[],row=[],cell='',quoted=false;csv=csv.replace(/^\uFEFF/,'');for(let i=0;i<csv.length;i++){const ch=csv[i];if(ch==='"'){if(quoted&&csv[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(ch===','&&!quoted){row.push(cell);cell='';}else if((ch==='\n'||ch==='\r')&&!quoted){if(ch==='\r'&&csv[i+1]==='\n')i++;row.push(cell);if(row.some(x=>x.trim()))out.push(row);row=[];cell='';}else cell+=ch;}row.push(cell);if(row.some(x=>x.trim()))out.push(row);return out}
  const key=s=>String(s||'').toLowerCase().trim().replace(/\([^)]*\)/g,'').replace(/[^a-z0-9]/g,'');
  const aliases={date:['date','day','reportdate','daterange','startdate'],platform:['platform','channel','source'],campaign:['campaign','campaignname'],ad_group:['adgroup','adset','adsetname','adgroupname'],ad:['ad','adname'],spend:['spend','cost','amountspent','amountspendusd','totalcost'],impressions:['impressions'],clicks:['clicks','linkclicks','outboundclicks'],registrations:['registrations','registered','registeredoffline','registrationsonly','registeredcustom'],scheduled:['scheduled','scheduledoffline','appointmentsbooked','bookedappointments'],attended:['attended','appointmentcompleted','appointmentcompletedoffline','attendedappointments'],first_purchases:['firstpurchases','firstpurchase','purchasedoffline','newpurchases'],revenue:['revenue','purchasevalue','firstpurchaserevenue'],action:['conversionaction','conversionactionname','conversionname','conversionactioncategory'],conversions:['conversions','allconversions','allconv','results']};
  function chooseCol(headers,names){for(const name of names){const index=headers.indexOf(name);if(index>=0)return index}return -1}
  function parseImport(content,filename){const all=csvRows(content);if(all.length<2)throw Error(filename+': CSV has no data rows');
    const headerIndex=all.findIndex(r=>{const h=r.map(key);return chooseCol(h,aliases.date)>=0&&(chooseCol(h,aliases.campaign)>=0||chooseCol(h,aliases.platform)>=0)});if(headerIndex<0)throw Error(filename+': header must include Date/Day and Campaign/Platform.');
    const headers=all[headerIndex].map(key);const idx={};Object.entries(aliases).forEach(([k,v])=>{idx[k]=chooseCol(headers,v)});
    const isGoogle=/(campaign report|google ads|search terms|conversion action)/i.test(content.slice(0,350))||idx.action>=0||headers.includes('cost');
    const isMeta=/(meta|facebook|instagram)/i.test(filename)||headers.includes('amountspent')||headers.includes('amountspendusd');
    const rows=[];let skipped=0;let unclassified=0;
    for(const fields of all.slice(headerIndex+1)){const get=k=>idx[k]<0?'':fields[idx[k]]||'';const date=isoDay(get('date'));if(!date){skipped++;continue}const action=get('action');const platform=String(get('platform')).trim()||(isMeta?'Meta Ads':isGoogle?'Google Ads':'Other');const campaign=String(get('campaign')||'(unspecified)').trim();const base={date,platform,campaign,ad_group:String(get('ad_group')).trim(),ad:String(get('ad')).trim()};FIELDS.forEach(k=>base[k]=idx[k]>=0?n(get(k)):null);
      if(idx.action>=0&&action.trim()){
        const metric=n(get('conversions'));
        base.registrations=idx.registrations>=0?base.registrations:null;
        base.scheduled=idx.scheduled>=0?base.scheduled:null;
        base.attended=idx.attended>=0?base.attended:null;
        base.first_purchases=idx.first_purchases>=0?base.first_purchases:null;
        const label=key(action);if(metric!==null){if(/register|registration/.test(label))base.registrations=metric;else if(/scheduled|bookedappointment/.test(label))base.scheduled=metric;else if(/appointmentcompleted|attended/.test(label))base.attended=metric;else if(/returnpurchase|repeatpurchase/.test(label)){/* Exclude returning purchases */}else if(/firstpurchase|purchasedoffline|purchasenew/.test(label))base.first_purchases=metric;else unclassified++;}
        base._actionRows=true;
      }else if(idx.registrations<0&&idx.conversions>=0){unclassified++;}
      rows.push(base);
    }
    if(!rows.length)throw Error(filename+': no daily dates recognized.');
    // Action-segmented exports can repeat cost for each conversion action on one campaign/day.
    // Aggregate action counts while keeping maximum repeated spend rather than double-counting.
    const grouped=new Map();for(const r of rows){const id=[r.date,r.platform,r.campaign,r.ad_group,r.ad].join('\u001f');if(!grouped.has(id)){grouped.set(id,{...r});continue}const old=grouped.get(id);for(const k of FIELDS){if(r._actionRows||old._actionRows){if(k==='spend'||k==='clicks'||k==='impressions'){old[k]=old[k]===null?r[k]:r[k]===null?old[k]:Math.max(old[k],r[k]);}else if(r[k]!==null){old[k]=(old[k]||0)+r[k]}}else{old[k]=old[k]===null?r[k]:r[k]===null?old[k]:old[k]+r[k]}}old._actionRows=old._actionRows||r._actionRows;}
    return {rows:[...grouped.values()].map(({_actionRows,...r})=>r),skipped,unclassified};
  }
  async function importFiles(files){if(!files.length)return;const box=$('import-message');box.classList.remove('error');box.textContent='Reading files…';try{
    const imported=[];const details=[];for(const file of files){if(!/\.csv$/i.test(file.name))throw Error('CSV files only: '+file.name);if(file.size>8*1024*1024)throw Error(file.name+': file exceeds 8 MB. Export fewer columns or dates.');const t=await file.text();const parsed=parseImport(t,file.name);imported.push(...parsed.rows);details.push(`${file.name}: ${parsed.rows.length} daily segments${parsed.unclassified?'; '+parsed.unclassified+' generic/unknown conversion rows not treated as registrations':''}`)}
    const mode=document.querySelector('input[name="import-mode"]:checked').value;const combined=mode==='append'&&!state.demo?[...state.rows,...imported]:imported;
    const map=new Map();for(const r of combined)map.set([r.date,r.platform,r.campaign,r.ad_group,r.ad].join('\u001f'),r);state.rows=[...map.values()];state.demo=false;state.selection=null;store();render();box.textContent=`Imported ${imported.length} segments. ${details.join(' · ')}. Data remains in this browser.`;setTimeout(()=>{$('import-modal').hidden=true},750);
  }catch(e){box.classList.add('error');box.textContent=String(e.message||e)}}
  function exportSummary(){const x=subset(),a=aggregate(x.current),k=kpi(a);const record={start:x.start||'',end:x.end||'',platform:state.channel,grain:state.grain,segment:state.selection||'all',mode:state.demo?'SYNTHETIC DEMO':'IMPORTED CSV',spend:a.spend,registrations:a.registrations,cpr:k.cpr,scheduled:a.scheduled,attended:a.attended,show_rate:k.show,first_purchases:a.first_purchases,cost_first_purchase:k.cpa,generated_utc:new Date().toISOString()};const csv=Object.keys(record).join(',')+'\n'+Object.values(record).map(v=>v===null?'':String(v).includes(',')?'"'+String(v).replace(/"/g,'""')+'"':v).join(',')+'\n';const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const aTag=document.createElement('a');aTag.href=url;aTag.download='ivim-weight-loss-efficiency-'+(x.end||'report')+'.csv';document.body.appendChild(aTag);aTag.click();aTag.remove();setTimeout(()=>URL.revokeObjectURL(url),2000)}
  $('channel-filter').addEventListener('change',e=>{state.channel=e.target.value;state.selection=null;render()});$('period-filter').addEventListener('change',e=>{state.period=e.target.value;render()});$('grain-filter').addEventListener('change',e=>{state.grain=e.target.value;state.selection=null;render()});$('chart-metric').addEventListener('change',e=>{state.chartMetric=e.target.value;render()});$('campaign-search').addEventListener('input',e=>{state.search=e.target.value.trim().toLowerCase();render()});
  $('reset-button').addEventListener('click',()=>{state.channel='all';state.period='14';state.grain='campaign';state.selection=null;state.search='';state.chartMetric='cpr';$('channel-filter').value='all';$('period-filter').value='14';$('grain-filter').value='campaign';$('chart-metric').value='cpr';$('campaign-search').value='';render()});$('clear-selection').addEventListener('click',()=>{state.selection=null;render()});$('export-button').addEventListener('click',exportSummary);
  $('import-button').addEventListener('click',()=>{$('import-modal').hidden=false;$('import-message').textContent='';});$('close-modal').addEventListener('click',()=>{$('import-modal').hidden=true});$('import-modal').addEventListener('click',e=>{if(e.target===$('import-modal'))$('import-modal').hidden=true});document.addEventListener('keydown',e=>{if(e.key==='Escape')$('import-modal').hidden=true});
  $('dropzone').addEventListener('click',()=>$('file-input').click());$('dropzone').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('file-input').click()}});$('file-input').addEventListener('change',e=>{importFiles([...e.target.files]);e.target.value=''});$('dropzone').addEventListener('dragover',e=>{e.preventDefault();$('dropzone').style.borderColor='#248675'});$('dropzone').addEventListener('dragleave',()=>$('dropzone').style.borderColor='');$('dropzone').addEventListener('drop',e=>{e.preventDefault();$('dropzone').style.borderColor='';importFiles([...e.dataTransfer.files])});
  $('clear-data').addEventListener('click',()=>{if(!window.confirm('Clear all imported aggregate data in this browser and return to synthetic demo mode?'))return;try{localStorage.removeItem(STORAGE_KEY)}catch(_){}state.rows=demoData();state.demo=true;state.selection=null;render();$('import-message').textContent='Imported data cleared. Synthetic demo mode restored.'});$('dismiss-notice').addEventListener('click',()=>{$('notice').style.display='none'});
  bootstrap();
})();