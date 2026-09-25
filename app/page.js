"use client";

import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, CartesianGrid } from 'recharts';
import { ArrowUpRight, Activity, Users, CalendarCheck, BadgeDollarSign, TrendingUp, CircleAlert } from 'lucide-react';

const spendTrend=[
  {w:"Jun 29",google:59363,meta:31384},{w:"Jul 6",google:56444,meta:24187},{w:"Jul 13",google:55177,meta:24395},{w:"Jul 20",google:54292,meta:17261},{w:"Jul 27",google:41037,meta:15737},{w:"Aug 3",google:62074,meta:13022},{w:"Aug 10",google:51527,meta:24238},{w:"Aug 17",google:71412,meta:31370},{w:"Aug 24",google:36689,meta:30500},{w:"Aug 31",google:51339,meta:0},{w:"Sep 7",google:12071,meta:0},{w:"Sep 14",google:10510,meta:0},{w:"Sep 21",google:13216,meta:0}
];

const kpis=[
  ["Spend","$292.6K","Tirzepatide Google Search cohort"],
  ["Visitors","10,006","Campaign page visitors"],
  ["Registrations","865","Selected campaign cohort"],
  ["Scheduled","286","Created appointments"],
  ["Attended","189","Consults attended"],
  ["Revenue","$415.2K","First-purchase attributed"]
];

const funnel=[
  {label:"Impressions",value:"548.9K",conv:"100%",drop:""},
  {label:"Clicks",value:"18,588",conv:"3.39% CTR",drop:"96.6% did not click"},
  {label:"Visitors",value:"10,006",conv:"53.8% click→visit",drop:"46.2% lost"},
  {label:"Registrations",value:"865",conv:"8.65% visit→reg",drop:"91.4% lost"},
  {label:"Scheduled",value:"286",conv:"33.1% reg→sched",drop:"66.9% lost"},
  {label:"Attended",value:"189",conv:"66.1% sched→attend",drop:"33.9% lost"}
];

const sources=[
  {source:"Google Ads Click",views:3091,registered:"3.3%",scheduled:"0.7%",attended:"0.7%"},
  {source:"Direct / Search / Unknown",views:1310,registered:"5.2%",scheduled:"3.2%",attended:"3.2%"},
  {source:"Google Shopping",views:180,registered:"8.1%",scheduled:"5.6%",attended:"5.6%"},
  {source:"Meta",views:4387,registered:"3.2%",scheduled:"0.7%",attended:"0.7%"},
  {source:"Affiliate",views:3,registered:"0%",scheduled:"0%",attended:"0%"}
];

const opportunities=[
  {name:"Consult attendance",value:57,label:"No-show rate reported in campaign view"},
  {name:"Registration conversion",value:33,label:"Only 865 registrations from 10,006 visitors"},
  {name:"Measurement confidence",value:45,label:"Same-day CAC misses ~10-day purchase tail"},
  {name:"Lifecycle leverage",value:90,label:"Monthly revenue reportedly comes from existing patients"}
];

export default function Page(){
  return <main className="shell"><div className="container">
    <div className="topbar">
      <div className="brand"><div className="brandmark">I</div><div><h1>IVÍM Growth Command Center</h1><p>Acquisition → Care → Purchase → Retention</p></div></div>
      <div className="nav"><a href="#overview">Overview</a><a href="#funnel">Funnel</a><a href="#economics">Economics</a><a href="#plan">90-day plan</a></div>
    </div>

    <section className="hero" id="overview">
      <div><span className="eyebrow"><Activity size={14}/> Executive growth view · 90-day working baseline</span>
      <h2>Turn fragmented acquisition into one measurable patient growth system.</h2>
      <p>The near-term opportunity is not a cosmetic rebrand. It is to establish one commercial truth, remove the highest-value funnel leakage, and prove whether connected-care positioning can scale with stronger unit economics.</p></div>
      <div className="heroCard"><div className="label">CEO takeaway</div><strong>Fix leakage before scaling spend.</strong><span>Paid demand fell sharply after August, while no-show, attribution and lifecycle gaps remain material.</span></div>
    </section>

    <div className="grid kpis">{kpis.map(([label,value,sub])=><div className="card metric" key={label}><div className="label">{label}</div><div className="value">{value}</div><div className="sub">{sub}</div></div>)}</div>

    <section className="section" id="funnel">
      <div className="sectionTitle"><div><h3>Patient journey funnel</h3><p>Selected Tirzepatide Google Search cohort. Stages shown only where denominator is comparable.</p></div><span className="pill">Cohort-safe view</span></div>
      <div className="card"><div className="funnel">{funnel.map(s=><div className="stage" key={s.label}><div className="slabel">{s.label}</div><div className="svalue">{s.value}</div><div className="sconv">{s.conv}</div>{s.drop&&<div className="sdrop">{s.drop}</div>}</div>)}</div></div>
    </section>

    <section className="section">
      <div className="grid twoCol">
        <div className="card"><div className="sectionTitle"><div><h3>Spend compression</h3><p>Selected daily/weekly markers from the 90-day platform trend</p></div></div>
          <div style={{height:300}}><ResponsiveContainer width="100%" height="100%"><AreaChart data={spendTrend}><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#77e0d4" stopOpacity={0.35}/><stop offset="100%" stopColor="#77e0d4" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false}/><XAxis dataKey="w" stroke="#6f838b" fontSize={10}/><YAxis stroke="#6f838b" fontSize={10} tickFormatter={v=>"$"+Math.round(v/1000)+"K"}/><Tooltip contentStyle={{background:"#111a22",border:"1px solid rgba(255,255,255,.1)",borderRadius:12}}/><Area type="monotone" dataKey="google" stroke="#77e0d4" fill="url(#g)" strokeWidth={2}/><Area type="monotone" dataKey="meta" stroke="#9a86ff" fillOpacity={0} strokeWidth={2}/></AreaChart></ResponsiveContainer></div>
        </div>
        <div className="card">
          <div className="sectionTitle"><div><h3>Where value is leaking</h3><p>Priorities based on current evidence</p></div></div>
          {opportunities.map(o=><div className="signal" key={o.name}><div style={{flex:1}}><b>{o.name}</b><span style={{display:"block",marginTop:4}}>{o.label}</span><div className="bar"><div className="fill" style={{width:o.value+"%"}}/></div></div><strong style={{marginLeft:14}}>{o.value}%</strong></div>)}
        </div>
      </div>
    </section>

    <section className="section" id="economics">
      <div className="sectionTitle"><div><h3>Acquisition quality by source</h3><p>After-lander new-customer view. Use directionally until source definitions are reconciled.</p></div><span className="pill">Source quality</span></div>
      <div className="card"><table className="table"><thead><tr><th>Source</th><th>Visited lander</th><th>Registered</th><th>Scheduled</th><th>Attended</th></tr></thead><tbody>{sources.map(r=><tr key={r.source}><td>{r.source}</td><td>{r.views.toLocaleString()}</td><td>{r.registered}</td><td>{r.scheduled}</td><td>{r.attended}</td></tr>)}</tbody></table></div>
    </section>

    <section className="section">
      <div className="grid threeCol">
        <div className="card callout"><h4><CircleAlert size={16} style={{verticalAlign:"-3px",marginRight:6}}/>Measurement risk</h4><p>Current reporting mixes campaign, UTM-keyword, after-lander and first-purchase cohorts. A single linear funnel would be misleading until definitions are unified.</p></div>
        <div className="card callout"><h4><TrendingUp size={16} style={{verticalAlign:"-3px",marginRight:6}}/>Growth signal</h4><p>Paid spend collapsed into September, but downstream quality did not collapse at the same rate. That is a reason to diagnose, not simply declare channels broken.</p></div>
        <div className="card callout"><h4><BadgeDollarSign size={16} style={{verticalAlign:"-3px",marginRight:6}}/>Economic lens</h4><p>Move from same-day ROAS toward 30/60/90-day LTV:CAC, with show rate and purchase conversion as operating levers.</p></div>
      </div>
    </section>

    <section className="section" id="plan">
      <div className="sectionTitle"><div><h3>90-day growth plan</h3><p>Designed to make the connected-care strategy measurable before scaling it.</p></div></div>
      <div className="plan">
        <div className="card phase"><div className="day">Days 0–30</div><h4>Establish commercial truth</h4><ul><li>Define one KPI tree from spend to 90-day value.</li><li>Reconcile GA4, Metabase and platform attribution windows.</li><li>Baseline CAC, show rate, purchase rate and LTV by source.</li><li>Create shared CEO / CFO / CMO operating scorecard.</li><li>Lock source, campaign and landing-page naming standards.</li></ul></div>
        <div className="card phase"><div className="day">Days 31–60</div><h4>Remove the biggest leakage</h4><ul><li>Prioritize consult attendance and pre-consult nurture.</li><li>Test registration recovery and appointment reminders.</li><li>Improve landing-page message match and membership value framing.</li><li>Build abandoned-journey and lifecycle triggers.</li><li>Report every test as incremental patients and revenue, not CTR alone.</li></ul></div>
        <div className="card phase"><div className="day">Days 61–90</div><h4>Prove the new growth model</h4><ul><li>Run medication/price-led versus connected-care messaging tests.</li><li>Compare registration → show → purchase → early LTV.</li><li>Reallocate budget based on contribution, not platform ROAS alone.</li><li>Launch executive test roadmap across acquisition, LP and lifecycle.</li><li>Produce the 12-month scaling roadmap for connected care.</li></ul></div>
      </div>
    </section>

    <section className="section">
      <div className="card"><div className="sectionTitle"><div><h3>What success should look like by Day 90</h3><p>Targets should be finalized after the first 30-day baseline reconciliation.</p></div></div>
      <div className="grid threeCol"><div className="metric"><div className="label">Measurement</div><div className="value accent">1 source of truth</div><div className="sub">Spend → patient → consult → purchase → LTV</div></div><div className="metric"><div className="label">Operations</div><div className="value accent">Lower leakage</div><div className="sub">Show-rate and conversion gains tied to revenue</div></div><div className="metric"><div className="label">Strategy</div><div className="value accent">Validated positioning</div><div className="sub">Connected-care economics proven against control</div></div></div>
      </div>
    </section>

    <div className="footer">Prepared as a prospect strategy view from supplied Metabase exports and onboarding notes. Figures use different source cohorts where noted and should not be blended without denominator reconciliation.</div>
  </div></main>
}