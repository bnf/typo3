/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */
import{Chart as o,ArcElement as e,LineElement as r,BarElement as t,PointElement as a,BarController as i,BubbleController as n,DoughnutController as d,LineController as s,PieController as l,PolarAreaController as c,RadarController as g,ScatterController as h,CategoryScale as p,LinearScale as f,LogarithmicScale as u,RadialLinearScale as m,TimeScale as C,TimeSeriesScale as b,Decimation as v,Filler as w,Legend as y,Title as k,Tooltip as j,SubTitle as S}from"@typo3/dashboard/contrib/chartjs.js"
import M from"@typo3/core/event/regular-event.js"
import{DashboardWidgetContentRenderedEvent as q}from"@typo3/dashboard/dashboard.js"
export default new class{constructor(){this.selector=".dashboard-item",this.initialize()}initialize(){o.register(e,r,t,a,i,n,d,s,l,c,g,h,p,f,u,m,C,b,v,w,y,k,j,S),new M(q.eventName,((e,r)=>{e.preventDefault()
const t=e.widget.eventdata
if(void 0===t||void 0===t.graphConfig)return
const a=r.querySelector("canvas")
let i
if(null!==a&&(i=a.getContext("2d")),void 0===i)return
this.darkModeEnabled()?(t.graphConfig.options.color="#ccc",t.graphConfig.options.borderColor="#000",o.defaults.borderColor="rgba(255,255,255,.1)",o.defaults.color="#ccc"):(t.graphConfig.options.color="#666",t.graphConfig.options.borderColor="#fff",o.defaults.borderColor="rgba(0,0,0,.1)",o.defaults.color="#666")
const n=o.getChart(i)
if(n)return n.data=t.graphConfig.data,n.options=t.graphConfig.options,void n.update()
new o(i,t.graphConfig)})).delegateTo(document,this.selector)}darkModeEnabled(){const o=document.querySelector(this.selector),e=window.getComputedStyle(o).colorScheme
return"light only"!==e&&"light"!==e&&("dark only"===e||"dark"===e||window.matchMedia("(prefers-color-scheme: dark)").matches)}}
