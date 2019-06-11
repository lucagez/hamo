const every=(e=[],...t)=>{const{length:n}=e;for(let r=0;r<n;r++)new Promise(()=>e[r](...t))};function validator(...e){if(["oncebefore","before","after","onceafter"].indexOf(e[0])<0)throw new Error(`Undefined timing ${e[0]}`);if(e[1]&&"function"!=typeof e[1])throw new TypeError("Hook must be of type function")}function on(e,t){this.queues[e]=[...this.queues[e]||[],t]}function off(e){this.queues[e]=void 0}function wrap(e){return function(...t){validator(...t),e.apply(this,t),this.handler=build.apply(this)}}function build(){const{before:e,oncebefore:t,after:n,onceafter:r}=this.queues,o=t||e||n||r;let u="";return t&&(u+="this.every(this.queues.oncebefore, ...arguments);",u+="this.queues.oncebefore = undefined;"),e&&(u+="this.every(this.queues.before, ...arguments);"),o&&(u+="const result = this.func(...arguments);"),(n||r)&&(u+="Promise.resolve().then(() => {",r&&(u+="this.every(this.queues.onceafter, result, ...arguments);",u+="this.queues.onceafter = undefined;"),n&&(u+="this.every(this.queues.after, result, ...arguments);"),u+="});"),o&&(u+="return result;"),u.length>0?new Function(u):this.func}const hamo=e=>{if("function"!=typeof e)throw new TypeError("Hooked must be of type function");const t={queues:{},func:e,handler:e,build:build,every:every};return[(...e)=>t.handler(...e),wrap(on).bind(t),wrap(off).bind(t)]};module.exports=hamo;
