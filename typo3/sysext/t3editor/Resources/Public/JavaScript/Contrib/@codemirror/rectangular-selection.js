import{EditorSelection}from"@codemirror/state";import{EditorView}from"@codemirror/view";import{findColumn,countColumn}from"@codemirror/text";const MaxOff=2e3;function rectangleFor(e,t,o){let n=Math.min(t.line,o.line),l=Math.max(t.line,o.line),r=[];if(t.off>2e3||o.off>2e3||t.col<0||o.col<0){let i=Math.min(t.off,o.off),c=Math.max(t.off,o.off);for(let t=n;t<=l;t++){let o=e.doc.line(t);o.length<=c&&r.push(EditorSelection.range(o.from+i,o.to+c))}}else{let i=Math.min(t.col,o.col),c=Math.max(t.col,o.col);for(let t=n;t<=l;t++){let o=e.doc.line(t),n=findColumn(o.text,i,e.tabSize,!0);if(n>-1){let t=findColumn(o.text,c,e.tabSize);r.push(EditorSelection.range(o.from+n,o.from+t))}}}return r}function absoluteColumn(e,t){let o=e.coordsAtPos(e.viewport.from);return o?Math.round(Math.abs((o.left-t)/e.defaultCharacterWidth)):-1}function getPos(e,t){let o=e.posAtCoords({x:t.clientX,y:t.clientY},!1),n=e.state.doc.lineAt(o),l=o-n.from,r=l>2e3?-1:l==n.length?absoluteColumn(e,t.clientX):countColumn(n.text,e.state.tabSize,o-n.from);return{line:n.number,col:r,off:l}}function rectangleSelectionStyle(e,t){let o=getPos(e,t),n=e.state.selection;return o?{update(e){if(e.docChanged){let t=e.changes.mapPos(e.startState.doc.line(o.line).from),l=e.state.doc.lineAt(t);o={line:l.number,col:o.col,off:Math.min(o.off,l.length)},n=n.map(e.changes)}},get(t,l,r){let i=getPos(e,t);if(!i)return n;let c=rectangleFor(e.state,o,i);return c.length?r?EditorSelection.create(c.concat(n.ranges)):EditorSelection.create(c):n}}:null}function rectangularSelection(e){let t=(null==e?void 0:e.eventFilter)||(e=>e.altKey&&0==e.button);return EditorView.mouseSelectionStyle.of((e,o)=>t(o)?rectangleSelectionStyle(e,o):null)}export{rectangularSelection};