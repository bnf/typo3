var noop={value:()=>{}};function dispatch(){for(var n,t=0,r=arguments.length,e={};t<r;++t){if(!(n=arguments[t]+"")||n in e||/[\s.]/.test(n))throw new Error("illegal type: "+n);e[n]=[];}return new Dispatch(e)}function Dispatch(n){this._=n;}function parseTypenames(n,t){return n.trim().split(/^|\s+/).map((function(n){var r="",e=n.indexOf(".");if(e>=0&&(r=n.slice(e+1),n=n.slice(0,e)),n&&!t.hasOwnProperty(n))throw new Error("unknown type: "+n);return {type:n,name:r}}))}function get(n,t){for(var r,e=0,i=n.length;e<i;++e)if((r=n[e]).name===t)return r.value}function set(n,t,r){for(var e=0,i=n.length;e<i;++e)if(n[e].name===t){n[e]=noop,n=n.slice(0,e).concat(n.slice(e+1));break}return null!=r&&n.push({name:t,value:r}),n}Dispatch.prototype=dispatch.prototype={constructor:Dispatch,on:function(n,t){var r,e=this._,i=parseTypenames(n+"",e),o=-1,a=i.length;if(!(arguments.length<2)){if(null!=t&&"function"!=typeof t)throw new Error("invalid callback: "+t);for(;++o<a;)if(r=(n=i[o]).type)e[r]=set(e[r],n.name,t);else if(null==t)for(r in e)e[r]=set(e[r],n.name,null);return this}for(;++o<a;)if((r=(n=i[o]).type)&&(r=get(e[r],n.name)))return r},copy:function(){var n={},t=this._;for(var r in t)n[r]=t[r].slice();return new Dispatch(n)},call:function(n,t){if((r=arguments.length-2)>0)for(var r,e,i=new Array(r),o=0;o<r;++o)i[o]=arguments[o+2];if(!this._.hasOwnProperty(n))throw new Error("unknown type: "+n);for(o=0,r=(e=this._[n]).length;o<r;++o)e[o].value.apply(t,i);},apply:function(n,t,r){if(!this._.hasOwnProperty(n))throw new Error("unknown type: "+n);for(var e=this._[n],i=0,o=e.length;i<o;++i)e[i].value.apply(t,r);}};

export { dispatch };
