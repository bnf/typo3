const DefaultBufferLength=1024;let nextPropID=0;class Range{constructor(e,t){this.from=e,this.to=t}}class NodeProp{constructor(e={}){this.id=nextPropID++,this.perNode=!!e.perNode,this.deserialize=e.deserialize||(()=>{throw new Error("This node type doesn't define a deserialize function")})}add(e){if(this.perNode)throw new RangeError("Can't add per-node props to node types");return"function"!=typeof e&&(e=NodeType.match(e)),t=>{let r=e(t);return void 0===r?null:[this,r]}}}NodeProp.closedBy=new NodeProp({deserialize:e=>e.split(" ")}),NodeProp.openedBy=new NodeProp({deserialize:e=>e.split(" ")}),NodeProp.group=new NodeProp({deserialize:e=>e.split(" ")}),NodeProp.contextHash=new NodeProp({perNode:!0}),NodeProp.lookAhead=new NodeProp({perNode:!0}),NodeProp.mounted=new NodeProp({perNode:!0});class MountedTree{constructor(e,t,r){this.tree=e,this.overlay=t,this.parser=r}}const noProps=Object.create(null);class NodeType{constructor(e,t,r,n=0){this.name=e,this.props=t,this.id=r,this.flags=n}static define(e){let t=e.props&&e.props.length?Object.create(null):noProps,r=(e.top?1:0)|(e.skipped?2:0)|(e.error?4:0)|(null==e.name?8:0),n=new NodeType(e.name||"",t,e.id,r);if(e.props)for(let r of e.props)if(Array.isArray(r)||(r=r(n)),r){if(r[0].perNode)throw new RangeError("Can't store a per-node prop on a node type");t[r[0].id]=r[1]}return n}prop(e){return this.props[e.id]}get isTop(){return(1&this.flags)>0}get isSkipped(){return(2&this.flags)>0}get isError(){return(4&this.flags)>0}get isAnonymous(){return(8&this.flags)>0}is(e){if("string"==typeof e){if(this.name==e)return!0;let t=this.prop(NodeProp.group);return!!t&&t.indexOf(e)>-1}return this.id==e}static match(e){let t=Object.create(null);for(let r in e)for(let n of r.split(" "))t[n]=e[r];return e=>{for(let r=e.prop(NodeProp.group),n=-1;n<(r?r.length:0);n++){let i=t[n<0?e.name:r[n]];if(i)return i}}}}NodeType.none=new NodeType("",Object.create(null),0,8);class NodeSet{constructor(e){this.types=e;for(let t=0;t<e.length;t++)if(e[t].id!=t)throw new RangeError("Node type ids should correspond to array positions when creating a node set")}extend(...e){let t=[];for(let r of this.types){let n=null;for(let t of e){let e=t(r);e&&(n||(n=Object.assign({},r.props)),n[e[0].id]=e[1])}t.push(n?new NodeType(r.name,n,r.id,r.flags):r)}return new NodeSet(t)}}const CachedNode=new WeakMap,CachedInnerNode=new WeakMap;class Tree{constructor(e,t,r,n,i){if(this.type=e,this.children=t,this.positions=r,this.length=n,this.props=null,i&&i.length){this.props=Object.create(null);for(let[e,t]of i)this.props["number"==typeof e?e:e.id]=t}}toString(){let e=this.prop(NodeProp.mounted);if(e&&!e.overlay)return e.tree.toString();let t="";for(let e of this.children){let r=e.toString();r&&(t&&(t+=","),t+=r)}return this.type.name?(/\W/.test(this.type.name)&&!this.type.isError?JSON.stringify(this.type.name):this.type.name)+(t.length?"("+t+")":""):t}cursor(e,t=0){let r=null!=e&&CachedNode.get(this)||this.topNode,n=new TreeCursor(r);return null!=e&&(n.moveTo(e,t),CachedNode.set(this,n._tree)),n}fullCursor(){return new TreeCursor(this.topNode,1)}get topNode(){return new TreeNode(this,0,0,null)}resolve(e,t=0){let r=resolveNode(CachedNode.get(this)||this.topNode,e,t,!1);return CachedNode.set(this,r),r}resolveInner(e,t=0){let r=resolveNode(CachedInnerNode.get(this)||this.topNode,e,t,!0);return CachedInnerNode.set(this,r),r}iterate(e){let{enter:t,leave:r,from:n=0,to:i=this.length}=e;for(let e=this.cursor(),s=()=>e.node;;){let o=!1;if(e.from<=i&&e.to>=n&&(e.type.isAnonymous||!1!==t(e.type,e.from,e.to,s))){if(e.firstChild())continue;e.type.isAnonymous||(o=!0)}for(;o&&r&&r(e.type,e.from,e.to,s),o=e.type.isAnonymous,!e.nextSibling();){if(!e.parent())return;o=!0}}}prop(e){return e.perNode?this.props?this.props[e.id]:void 0:this.type.prop(e)}get propValues(){let e=[];if(this.props)for(let t in this.props)e.push([+t,this.props[t]]);return e}balance(e={}){return this.children.length<=8?this:balanceRange(NodeType.none,this.children,this.positions,0,this.children.length,0,this.length,(e,t,r)=>new Tree(this.type,e,t,r,this.propValues),e.makeTree||((e,t,r)=>new Tree(NodeType.none,e,t,r)))}static build(e){return buildTree(e)}}Tree.empty=new Tree(NodeType.none,[],[],0);class FlatBufferCursor{constructor(e,t){this.buffer=e,this.index=t}get id(){return this.buffer[this.index-4]}get start(){return this.buffer[this.index-3]}get end(){return this.buffer[this.index-2]}get size(){return this.buffer[this.index-1]}get pos(){return this.index}next(){this.index-=4}fork(){return new FlatBufferCursor(this.buffer,this.index)}}class TreeBuffer{constructor(e,t,r){this.buffer=e,this.length=t,this.set=r}get type(){return NodeType.none}toString(){let e=[];for(let t=0;t<this.buffer.length;)e.push(this.childString(t)),t=this.buffer[t+3];return e.join(",")}childString(e){let t=this.buffer[e],r=this.buffer[e+3],n=this.set.types[t],i=n.name;if(/\W/.test(i)&&!n.isError&&(i=JSON.stringify(i)),r==(e+=4))return i;let s=[];for(;e<r;)s.push(this.childString(e)),e=this.buffer[e+3];return i+"("+s.join(",")+")"}findChild(e,t,r,n,i){let{buffer:s}=this,o=-1;for(let h=e;h!=t&&!(checkSide(i,n,s[h+1],s[h+2])&&(o=h,r>0));h=s[h+3]);return o}slice(e,t,r,n){let i=this.buffer,s=new Uint16Array(t-e);for(let n=e,o=0;n<t;)s[o++]=i[n++],s[o++]=i[n++]-r,s[o++]=i[n++]-r,s[o++]=i[n++]-e;return new TreeBuffer(s,n-r,this.set)}}function checkSide(e,t,r,n){switch(e){case-2:return r<t;case-1:return n>=t&&r<t;case 0:return r<t&&n>t;case 1:return r<=t&&n>t;case 2:return n>t;case 4:return!0}}function enterUnfinishedNodesBefore(e,t){let r=e.childBefore(t);for(;r;){let t=r.lastChild;if(!t||t.to!=r.to)break;t.type.isError&&t.from==t.to?(e=r,r=t.prevSibling):r=t}return e}function resolveNode(e,t,r,n){for(var i;e.from==e.to||(r<1?e.from>=t:e.from>t)||(r>-1?e.to<=t:e.to<t);){let t=!n&&e instanceof TreeNode&&e.index<0?null:e.parent;if(!t)return e;e=t}if(n)for(let n=e,s=n.parent;s;n=s,s=n.parent)n instanceof TreeNode&&n.index<0&&(null===(i=s.enter(t,r,!0))||void 0===i?void 0:i.from)!=n.from&&(e=s);for(;;){let i=e.enter(t,r,n);if(!i)return e;e=i}}class TreeNode{constructor(e,t,r,n){this.node=e,this._from=t,this.index=r,this._parent=n}get type(){return this.node.type}get name(){return this.node.type.name}get from(){return this._from}get to(){return this._from+this.node.length}nextChild(e,t,r,n,i=0){for(let s=this;;){for(let{children:o,positions:h}=s.node,l=t>0?o.length:-1;e!=l;e+=t){let l=o[e],f=h[e]+s._from;if(checkSide(n,r,f,f+l.length))if(l instanceof TreeBuffer){if(2&i)continue;let o=l.findChild(0,l.buffer.length,t,r-f,n);if(o>-1)return new BufferNode(new BufferContext(s,l,e,f),null,o)}else if(1&i||!l.type.isAnonymous||hasChild(l)){let o;if(!(1&i)&&l.props&&(o=l.prop(NodeProp.mounted))&&!o.overlay)return new TreeNode(o.tree,f,e,s);let h=new TreeNode(l,f,e,s);return 1&i||!h.type.isAnonymous?h:h.nextChild(t<0?l.children.length-1:0,t,r,n)}}if(1&i||!s.type.isAnonymous)return null;if(e=s.index>=0?s.index+t:t<0?-1:s._parent.node.children.length,s=s._parent,!s)return null}}get firstChild(){return this.nextChild(0,1,0,4)}get lastChild(){return this.nextChild(this.node.children.length-1,-1,0,4)}childAfter(e){return this.nextChild(0,1,e,2)}childBefore(e){return this.nextChild(this.node.children.length-1,-1,e,-2)}enter(e,t,r=!0,n=!0){let i;if(r&&(i=this.node.prop(NodeProp.mounted))&&i.overlay){let r=e-this.from;for(let{from:e,to:n}of i.overlay)if((t>0?e<=r:e<r)&&(t<0?n>=r:n>r))return new TreeNode(i.tree,i.overlay[0].from+this.from,-1,this)}return this.nextChild(0,1,e,t,n?0:2)}nextSignificantParent(){let e=this;for(;e.type.isAnonymous&&e._parent;)e=e._parent;return e}get parent(){return this._parent?this._parent.nextSignificantParent():null}get nextSibling(){return this._parent&&this.index>=0?this._parent.nextChild(this.index+1,1,0,4):null}get prevSibling(){return this._parent&&this.index>=0?this._parent.nextChild(this.index-1,-1,0,4):null}get cursor(){return new TreeCursor(this)}get tree(){return this.node}toTree(){return this.node}resolve(e,t=0){return resolveNode(this,e,t,!1)}resolveInner(e,t=0){return resolveNode(this,e,t,!0)}enterUnfinishedNodesBefore(e){return enterUnfinishedNodesBefore(this,e)}getChild(e,t=null,r=null){let n=getChildren(this,e,t,r);return n.length?n[0]:null}getChildren(e,t=null,r=null){return getChildren(this,e,t,r)}toString(){return this.node.toString()}}function getChildren(e,t,r,n){let i=e.cursor,s=[];if(!i.firstChild())return s;if(null!=r)for(;!i.type.is(r);)if(!i.nextSibling())return s;for(;;){if(null!=n&&i.type.is(n))return s;if(i.type.is(t)&&s.push(i.node),!i.nextSibling())return null==n?s:[]}}class BufferContext{constructor(e,t,r,n){this.parent=e,this.buffer=t,this.index=r,this.start=n}}class BufferNode{constructor(e,t,r){this.context=e,this._parent=t,this.index=r,this.type=e.buffer.set.types[e.buffer.buffer[r]]}get name(){return this.type.name}get from(){return this.context.start+this.context.buffer.buffer[this.index+1]}get to(){return this.context.start+this.context.buffer.buffer[this.index+2]}child(e,t,r){let{buffer:n}=this.context,i=n.findChild(this.index+4,n.buffer[this.index+3],e,t-this.context.start,r);return i<0?null:new BufferNode(this.context,this,i)}get firstChild(){return this.child(1,0,4)}get lastChild(){return this.child(-1,0,4)}childAfter(e){return this.child(1,e,2)}childBefore(e){return this.child(-1,e,-2)}enter(e,t,r,n=!0){if(!n)return null;let{buffer:i}=this.context,s=i.findChild(this.index+4,i.buffer[this.index+3],t>0?1:-1,e-this.context.start,t);return s<0?null:new BufferNode(this.context,this,s)}get parent(){return this._parent||this.context.parent.nextSignificantParent()}externalSibling(e){return this._parent?null:this.context.parent.nextChild(this.context.index+e,e,0,4)}get nextSibling(){let{buffer:e}=this.context,t=e.buffer[this.index+3];return t<(this._parent?e.buffer[this._parent.index+3]:e.buffer.length)?new BufferNode(this.context,this._parent,t):this.externalSibling(1)}get prevSibling(){let{buffer:e}=this.context,t=this._parent?this._parent.index+4:0;return this.index==t?this.externalSibling(-1):new BufferNode(this.context,this._parent,e.findChild(t,this.index,-1,0,4))}get cursor(){return new TreeCursor(this)}get tree(){return null}toTree(){let e=[],t=[],{buffer:r}=this.context,n=this.index+4,i=r.buffer[this.index+3];if(i>n){let s=r.buffer[this.index+1],o=r.buffer[this.index+2];e.push(r.slice(n,i,s,o)),t.push(0)}return new Tree(this.type,e,t,this.to-this.from)}resolve(e,t=0){return resolveNode(this,e,t,!1)}resolveInner(e,t=0){return resolveNode(this,e,t,!0)}enterUnfinishedNodesBefore(e){return enterUnfinishedNodesBefore(this,e)}toString(){return this.context.buffer.childString(this.index)}getChild(e,t=null,r=null){let n=getChildren(this,e,t,r);return n.length?n[0]:null}getChildren(e,t=null,r=null){return getChildren(this,e,t,r)}}class TreeCursor{constructor(e,t=0){if(this.mode=t,this.buffer=null,this.stack=[],this.index=0,this.bufferNode=null,e instanceof TreeNode)this.yieldNode(e);else{this._tree=e.context.parent,this.buffer=e.context;for(let t=e._parent;t;t=t._parent)this.stack.unshift(t.index);this.bufferNode=e,this.yieldBuf(e.index)}}get name(){return this.type.name}yieldNode(e){return!!e&&(this._tree=e,this.type=e.type,this.from=e.from,this.to=e.to,!0)}yieldBuf(e,t){this.index=e;let{start:r,buffer:n}=this.buffer;return this.type=t||n.set.types[n.buffer[e]],this.from=r+n.buffer[e+1],this.to=r+n.buffer[e+2],!0}yield(e){return!!e&&(e instanceof TreeNode?(this.buffer=null,this.yieldNode(e)):(this.buffer=e.context,this.yieldBuf(e.index,e.type)))}toString(){return this.buffer?this.buffer.buffer.childString(this.index):this._tree.toString()}enterChild(e,t,r){if(!this.buffer)return this.yield(this._tree.nextChild(e<0?this._tree.node.children.length-1:0,e,t,r,this.mode));let{buffer:n}=this.buffer,i=n.findChild(this.index+4,n.buffer[this.index+3],e,t-this.buffer.start,r);return!(i<0)&&(this.stack.push(this.index),this.yieldBuf(i))}firstChild(){return this.enterChild(1,0,4)}lastChild(){return this.enterChild(-1,0,4)}childAfter(e){return this.enterChild(1,e,2)}childBefore(e){return this.enterChild(-1,e,-2)}enter(e,t,r=!0,n=!0){return this.buffer?!!n&&this.enterChild(1,e,t):this.yield(this._tree.enter(e,t,r&&!(1&this.mode),n))}parent(){if(!this.buffer)return this.yieldNode(1&this.mode?this._tree._parent:this._tree.parent);if(this.stack.length)return this.yieldBuf(this.stack.pop());let e=1&this.mode?this.buffer.parent:this.buffer.parent.nextSignificantParent();return this.buffer=null,this.yieldNode(e)}sibling(e){if(!this.buffer)return!!this._tree._parent&&this.yield(this._tree.index<0?null:this._tree._parent.nextChild(this._tree.index+e,e,0,4,this.mode));let{buffer:t}=this.buffer,r=this.stack.length-1;if(e<0){let e=r<0?0:this.stack[r]+4;if(this.index!=e)return this.yieldBuf(t.findChild(e,this.index,-1,0,4))}else{let e=t.buffer[this.index+3];if(e<(r<0?t.buffer.length:t.buffer[this.stack[r]+3]))return this.yieldBuf(e)}return r<0&&this.yield(this.buffer.parent.nextChild(this.buffer.index+e,e,0,4,this.mode))}nextSibling(){return this.sibling(1)}prevSibling(){return this.sibling(-1)}atLastNode(e){let t,r,{buffer:n}=this;if(n){if(e>0){if(this.index<n.buffer.buffer.length)return!1}else for(let e=0;e<this.index;e++)if(n.buffer.buffer[e+3]<this.index)return!1;({index:t,parent:r}=n)}else({index:t,_parent:r}=this._tree);for(;r;({index:t,_parent:r}=r))if(t>-1)for(let n=t+e,i=e<0?-1:r.node.children.length;n!=i;n+=e){let e=r.node.children[n];if(1&this.mode||e instanceof TreeBuffer||!e.type.isAnonymous||hasChild(e))return!1}return!0}move(e,t){if(t&&this.enterChild(e,0,4))return!0;for(;;){if(this.sibling(e))return!0;if(this.atLastNode(e)||!this.parent())return!1}}next(e=!0){return this.move(1,e)}prev(e=!0){return this.move(-1,e)}moveTo(e,t=0){for(;(this.from==this.to||(t<1?this.from>=e:this.from>e)||(t>-1?this.to<=e:this.to<e))&&this.parent(););for(;this.enterChild(1,e,t););return this}get node(){if(!this.buffer)return this._tree;let e=this.bufferNode,t=null,r=0;if(e&&e.context==this.buffer)e:for(let n=this.index,i=this.stack.length;i>=0;){for(let s=e;s;s=s._parent)if(s.index==n){if(n==this.index)return s;t=s,r=i+1;break e}n=this.stack[--i]}for(let e=r;e<this.stack.length;e++)t=new BufferNode(this.buffer,t,this.stack[e]);return this.bufferNode=new BufferNode(this.buffer,t,this.index)}get tree(){return this.buffer?null:this._tree.node}}function hasChild(e){return e.children.some(e=>e instanceof TreeBuffer||!e.type.isAnonymous||hasChild(e))}function buildTree(e){var t;let{buffer:r,nodeSet:n,maxBufferLength:i=DefaultBufferLength,reused:s=[],minRepeatType:o=n.types.length}=e,h=Array.isArray(r)?new FlatBufferCursor(r,r.length):r,l=n.types,f=0,u=0;function a(e,t,r,g,m){let{id:b,start:x,end:y,size:N}=h,C=u;for(;N<0;){if(h.next(),-1==N){let t=s[b];return r.push(t),void g.push(x-e)}if(-3==N)return void(f=b);if(-4==N)return void(u=b);throw new RangeError("Unrecognized record size: "+N)}let v,w,T=l[b],S=x-e;if(y-x<=i&&(w=function(e,t){let r=h.fork(),n=0,s=0,l=0,f=r.end-i,u={size:0,start:0,skip:0};e:for(let i=r.pos-e;r.pos>i;){let e=r.size;if(r.id==t&&e>=0){u.size=n,u.start=s,u.skip=l,l+=4,n+=4,r.next();continue}let h=r.pos-e;if(e<0||h<i||r.start<f)break;let a=r.id>=o?4:0,d=r.start;for(r.next();r.pos>h;){if(r.size<0){if(-3!=r.size)break e;a+=4}else r.id>=o&&(a+=4);r.next()}s=d,n+=e,l+=a}return(t<0||n==e)&&(u.size=n,u.start=s,u.skip=l),u.size>4?u:void 0}(h.pos-t,m))){let t=new Uint16Array(w.size-w.skip),r=h.pos-w.size,i=t.length;for(;h.pos>r;)i=c(w.start,t,i);v=new TreeBuffer(t,y-w.start,n),S=w.start-e}else{let e=h.pos-N;h.next();let t=[],r=[],n=b>=o?b:-1,s=0,l=y;for(;h.pos>e;)n>=0&&h.id==n&&h.size>=0?(h.end<=l-i&&(d(t,r,x,s,h.end,l,n,C),s=t.length,l=h.end),h.next()):a(x,e,t,r,n);if(n>=0&&s>0&&s<t.length&&d(t,r,x,s,x,l,n,C),t.reverse(),r.reverse(),n>-1&&s>0){let e=function(e){return(t,r,n)=>{let i,s,o=0,h=t.length-1;if(h>=0&&(i=t[h])instanceof Tree){if(!h&&i.type==e&&i.length==n)return i;(s=i.prop(NodeProp.lookAhead))&&(o=r[h]+i.length+s)}return p(e,t,r,n,o)}}(T);v=balanceRange(T,t,r,0,t.length,0,y-x,e,e)}else v=p(T,t,r,y-x,C-y)}r.push(v),g.push(S)}function d(e,t,r,i,s,o,h,l){let f=[],u=[];for(;e.length>i;)f.push(e.pop()),u.push(t.pop()+r-s);e.push(p(n.types[h],f,u,o-s,l-o)),t.push(s-r)}function p(e,t,r,n,i=0,s){if(f){let e=[NodeProp.contextHash,f];s=s?[e].concat(s):[e]}if(i>25){let e=[NodeProp.lookAhead,i];s=s?[e].concat(s):[e]}return new Tree(e,t,r,n,s)}function c(e,t,r){let{id:n,start:i,end:s,size:l}=h;if(h.next(),l>=0&&n<o){let o=r;if(l>4){let n=h.pos-(l-4);for(;h.pos>n;)r=c(e,t,r)}t[--r]=o,t[--r]=s-e,t[--r]=i-e,t[--r]=n}else-3==l?f=n:-4==l&&(u=n);return r}let g=[],m=[];for(;h.pos>0;)a(e.start||0,e.bufferStart||0,g,m,-1);let b=null!==(t=e.length)&&void 0!==t?t:g.length?m[0]+g[0].length:0;return new Tree(l[e.topID],g.reverse(),m.reverse(),b)}const nodeSizeCache=new WeakMap;function nodeSize(e,t){if(!e.isAnonymous||t instanceof TreeBuffer||t.type!=e)return 1;let r=nodeSizeCache.get(t);if(null==r){r=1;for(let n of t.children){if(n.type!=e||!(n instanceof Tree)){r=1;break}r+=nodeSize(e,n)}nodeSizeCache.set(t,r)}return r}function balanceRange(e,t,r,n,i,s,o,h,l){let f=0;for(let r=n;r<i;r++)f+=nodeSize(e,t[r]);let u=Math.ceil(1.5*f/8),a=[],d=[];return function t(r,n,i,o,h){for(let f=i;f<o;){let i=f,p=n[f],c=nodeSize(e,r[f]);for(f++;f<o;f++){let t=nodeSize(e,r[f]);if(c+t>=u)break;c+=t}if(f==i+1){if(c>u){let e=r[i];t(e.children,e.positions,0,e.children.length,n[i]+h);continue}a.push(r[i])}else{let t=n[f-1]+r[f-1].length-p;a.push(balanceRange(e,r,n,i,f,p,t,null,l))}d.push(p+h-s)}}(t,r,n,i,0),(h||l)(a,d,o)}class TreeFragment{constructor(e,t,r,n,i=!1,s=!1){this.from=e,this.to=t,this.tree=r,this.offset=n,this.open=(i?1:0)|(s?2:0)}get openStart(){return(1&this.open)>0}get openEnd(){return(2&this.open)>0}static addTree(e,t=[],r=!1){let n=[new TreeFragment(0,e.length,e,0,!1,r)];for(let r of t)r.to>e.length&&n.push(r);return n}static applyChanges(e,t,r=128){if(!t.length)return e;let n=[],i=1,s=e.length?e[0]:null;for(let o=0,h=0,l=0;;o++){let f=o<t.length?t[o]:null,u=f?f.fromA:1e9;if(u-h>=r)for(;s&&s.from<u;){let t=s;if(h>=t.from||u<=t.to||l){let e=Math.max(t.from,h)-l,r=Math.min(t.to,u)-l;t=e>=r?null:new TreeFragment(e,r,t.tree,t.offset+l,o>0,!!f)}if(t&&n.push(t),s.to>u)break;s=i<e.length?e[i++]:null}if(!f)break;h=f.toA,l=f.toA-f.toB}return n}}class Parser{startParse(e,t,r){return"string"==typeof e&&(e=new StringInput(e)),r=r?r.length?r.map(e=>new Range(e.from,e.to)):[new Range(0,0)]:[new Range(0,e.length)],this.createParse(e,t||[],r)}parse(e,t,r){let n=this.startParse(e,t,r);for(;;){let e=n.advance();if(e)return e}}}class StringInput{constructor(e){this.string=e}get length(){return this.string.length}chunk(e){return this.string.slice(e)}get lineChunks(){return!1}read(e,t){return this.string.slice(e,t)}}function parseMixed(e){return(t,r,n,i)=>new MixedParse(t,e,r,n,i)}class InnerParse{constructor(e,t,r,n,i){this.parser=e,this.parse=t,this.overlay=r,this.target=n,this.ranges=i}}class ActiveOverlay{constructor(e,t,r,n,i,s,o){this.parser=e,this.predicate=t,this.mounts=r,this.index=n,this.start=i,this.target=s,this.prev=o,this.depth=0,this.ranges=[]}}const stoppedInner=new NodeProp({perNode:!0});class MixedParse{constructor(e,t,r,n,i){this.nest=t,this.input=r,this.fragments=n,this.ranges=i,this.inner=[],this.innerDone=0,this.baseTree=null,this.stoppedAt=null,this.baseParse=e}advance(){if(this.baseParse){let e=this.baseParse.advance();if(!e)return null;if(this.baseParse=null,this.baseTree=e,this.startInner(),null!=this.stoppedAt)for(let e of this.inner)e.parse.stopAt(this.stoppedAt)}if(this.innerDone==this.inner.length){let e=this.baseTree;return null!=this.stoppedAt&&(e=new Tree(e.type,e.children,e.positions,e.length,e.propValues.concat([[stoppedInner,this.stoppedAt]]))),e}let e=this.inner[this.innerDone],t=e.parse.advance();if(t){this.innerDone++;let r=Object.assign(Object.create(null),e.target.props);r[NodeProp.mounted.id]=new MountedTree(t,e.overlay,e.parser),e.target.props=r}return null}get parsedPos(){if(this.baseParse)return 0;let e=this.input.length;for(let t=this.innerDone;t<this.inner.length;t++)this.inner[t].ranges[0].from<e&&(e=Math.min(e,this.inner[t].parse.parsedPos));return e}stopAt(e){if(this.stoppedAt=e,this.baseParse)this.baseParse.stopAt(e);else for(let t=this.innerDone;t<this.inner.length;t++)this.inner[t].parse.stopAt(e)}startInner(){let e=new FragmentCursor(this.fragments),t=null,r=null,n=new TreeCursor(new TreeNode(this.baseTree,this.ranges[0].from,0,null),1);e:for(let i,s;null==this.stoppedAt||n.from<this.stoppedAt;){let o,h=!0;if(e.hasNode(n)){if(t){let e=t.mounts.find(e=>e.frag.from<=n.from&&e.frag.to>=n.to&&e.mount.overlay);if(e)for(let r of e.mount.overlay){let i=r.from+e.pos,s=r.to+e.pos;i>=n.from&&s<=n.to&&t.ranges.push({from:i,to:s})}}h=!1}else if(r&&(s=checkCover(r.ranges,n.from,n.to)))h=2!=s;else if(!n.type.isAnonymous&&n.from<n.to&&(i=this.nest(n,this.input))){n.tree||materialize(n);let s=e.findMounts(n.from,i.parser);if("function"==typeof i.overlay)t=new ActiveOverlay(i.parser,i.overlay,s,this.inner.length,n.from,n.tree,t);else{let e=punchRanges(this.ranges,i.overlay||[new Range(n.from,n.to)]);e.length&&this.inner.push(new InnerParse(i.parser,i.parser.startParse(this.input,enterFragments(s,e),e),i.overlay?i.overlay.map(e=>new Range(e.from-n.from,e.to-n.from)):null,n.tree,e)),i.overlay?e.length&&(r={ranges:e,depth:0,prev:r}):h=!1}}else t&&(o=t.predicate(n))&&(!0===o&&(o=new Range(n.from,n.to)),o.from<o.to&&t.ranges.push(o));if(h&&n.firstChild())t&&t.depth++,r&&r.depth++;else for(;!n.nextSibling();){if(!n.parent())break e;if(t&&!--t.depth){let e=punchRanges(this.ranges,t.ranges);e.length&&this.inner.splice(t.index,0,new InnerParse(t.parser,t.parser.startParse(this.input,enterFragments(t.mounts,e),e),t.ranges.map(e=>new Range(e.from-t.start,e.to-t.start)),t.target,e)),t=t.prev}r&&!--r.depth&&(r=r.prev)}}}}function checkCover(e,t,r){for(let n of e){if(n.from>=r)break;if(n.to>t)return n.from<=t&&n.to>=r?2:1}return 0}function sliceBuf(e,t,r,n,i,s){if(t<r){let o=e.buffer[t+1],h=e.buffer[r-2];n.push(e.slice(t,r,o,h)),i.push(o-s)}}function materialize(e){let{node:t}=e,r=0;do{e.parent(),r++}while(!e.tree);let n=0,i=e.tree,s=0;for(;s=i.positions[n]+e.from,!(s<=t.from&&s+i.children[n].length>=t.to);n++);let o=i.children[n],h=o.buffer;i.children[n]=function e(r,n,i,l,f){let u=r;for(;h[u+2]+s<=t.from;)u=h[u+3];let a=[],d=[];sliceBuf(o,r,u,a,d,l);let p=h[u+1],c=h[u+2],g=p+s==t.from&&c+s==t.to&&h[u]==t.type.id;return a.push(g?t.toTree():e(u+4,h[u+3],o.set.types[h[u]],p,c-p)),d.push(p-l),sliceBuf(o,h[u+3],n,a,d,l),new Tree(i,a,d,f)}(0,h.length,NodeType.none,0,o.length);for(let n=0;n<=r;n++)e.childAfter(t.from)}class StructureCursor{constructor(e,t){this.offset=t,this.done=!1,this.cursor=e.fullCursor()}moveTo(e){let{cursor:t}=this,r=e-this.offset;for(;!this.done&&t.from<r;)t.to>=e&&t.enter(r,1,!1,!1)||t.next(!1)||(this.done=!0)}hasNode(e){if(this.moveTo(e.from),!this.done&&this.cursor.from+this.offset==e.from&&this.cursor.tree)for(let t=this.cursor.tree;;){if(t==e.tree)return!0;if(!(t.children.length&&0==t.positions[0]&&t.children[0]instanceof Tree))break;t=t.children[0]}return!1}}class FragmentCursor{constructor(e){var t;if(this.fragments=e,this.curTo=0,this.fragI=0,e.length){let r=this.curFrag=e[0];this.curTo=null!==(t=r.tree.prop(stoppedInner))&&void 0!==t?t:r.to,this.inner=new StructureCursor(r.tree,-r.offset)}else this.curFrag=this.inner=null}hasNode(e){for(;this.curFrag&&e.from>=this.curTo;)this.nextFrag();return this.curFrag&&this.curFrag.from<=e.from&&this.curTo>=e.to&&this.inner.hasNode(e)}nextFrag(){var e;if(this.fragI++,this.fragI==this.fragments.length)this.curFrag=this.inner=null;else{let t=this.curFrag=this.fragments[this.fragI];this.curTo=null!==(e=t.tree.prop(stoppedInner))&&void 0!==e?e:t.to,this.inner=new StructureCursor(t.tree,-t.offset)}}findMounts(e,t){var r;let n=[];if(this.inner){this.inner.cursor.moveTo(e,1);for(let e=this.inner.cursor.node;e;e=e.parent){let i=null===(r=e.tree)||void 0===r?void 0:r.prop(NodeProp.mounted);if(i&&i.parser==t)for(let t=this.fragI;t<this.fragments.length;t++){let r=this.fragments[t];if(r.from>=e.to)break;r.tree==this.curFrag.tree&&n.push({frag:r,pos:e.from-r.offset,mount:i})}}}return n}}function punchRanges(e,t){let r=null,n=t;for(let i=1,s=0;i<e.length;i++){let o=e[i-1].to,h=e[i].from;for(;s<n.length;s++){let e=n[s];if(e.from>=h)break;e.to<=o||(r||(n=r=t.slice()),e.from<o?(r[s]=new Range(e.from,o),e.to>h&&r.splice(s+1,0,new Range(h,e.to))):e.to>h?r[s--]=new Range(h,e.to):r.splice(s--,1))}}return n}function findCoverChanges(e,t,r,n){let i=0,s=0,o=!1,h=!1,l=-1e9,f=[];for(;;){let u=i==e.length?1e9:o?e[i].to:e[i].from,a=s==t.length?1e9:h?t[s].to:t[s].from;if(o!=h){let e=Math.max(l,r),t=Math.min(u,a,n);e<t&&f.push(new Range(e,t))}if(l=Math.min(u,a),1e9==l)break;u==l&&(o?(o=!1,i++):o=!0),a==l&&(h?(h=!1,s++):h=!0)}return f}function enterFragments(e,t){let r=[];for(let{pos:n,mount:i,frag:s}of e){let e=n+(i.overlay?i.overlay[0].from:0),o=e+i.tree.length,h=Math.max(s.from,e),l=Math.min(s.to,o);if(i.overlay){let o=findCoverChanges(t,i.overlay.map(e=>new Range(e.from+n,e.to+n)),h,l);for(let t=0,n=h;;t++){let h=t==o.length,f=h?l:o[t].from;if(f>n&&r.push(new TreeFragment(n,f,i.tree,-e,s.from>=n,s.to<=f)),h)break;n=o[t].to}}else r.push(new TreeFragment(h,l,i.tree,-e,s.from>=e,s.to<=o))}return r}export{DefaultBufferLength,MountedTree,NodeProp,NodeSet,NodeType,Parser,Tree,TreeBuffer,TreeCursor,TreeFragment,parseMixed};