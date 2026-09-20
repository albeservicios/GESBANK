/*
 GESBANK - MVP independiente.
 Para demo usa localStorage. Para dinero real NO uses este cliente como libro contable:
 las operaciones reales deben ejecutarse en backend autorizado y con controles de seguridad.
*/
const KEY="gesbank_demo_v1";
const state=JSON.parse(localStorage.getItem(KEY)||'{"users":{},"session":null,"movements":{}}');

const $=s=>document.querySelector(s);
const money=n=>new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS"}).format(n);
const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
const uid=()=>crypto.randomUUID();
const now=()=>new Date().toLocaleString("es-AR");

function current(){return state.session?state.users[state.session]:null}
function render(){
  const u=current();
  $("#authView").hidden=!!u; $("#bankView").hidden=!u; $("#logout").hidden=!u;
  if(!u)return;
  $("#balance").textContent=money(u.balance);
  $("#alias").textContent=u.alias;
  $("#accountId").textContent=u.accountId;
  renderMovements();
}
function renderMovements(){
  const u=current(), box=$("#movements"); box.innerHTML="";
  const arr=(state.movements[u.id]||[]).slice().reverse().slice(0,8);
  if(!arr.length){box.innerHTML='<p class="msg">Todavía no hay movimientos.</p>';return}
  for(const m of arr){
    const el=document.importNode($("#movementTemplate").content,true);
    el.querySelector(".movement-icon").textContent=m.type==="credit"?"↓":m.type==="debit"?"↑":"▣";
    el.querySelector(".movement-title").textContent=m.title;
    el.querySelector(".movement-detail").textContent=m.detail||"";
    el.querySelector(".movement-date").textContent=m.date;
    const amount=el.querySelector(".movement-amount");
    amount.textContent=(m.type==="credit"?"+ ":"- ")+money(m.amount);
    amount.classList.add(m.type==="credit"?"credit":"debit");
    box.appendChild(el);
  }
}
function addMovement(userId,m){
  state.movements[userId]??=[];
  state.movements[userId].push({id:uid(),date:now(),...m});
}
function findUser(identifier){
  return Object.values(state.users).find(u=>u.alias.toLowerCase()===identifier.toLowerCase()||u.email.toLowerCase()===identifier.toLowerCase()||u.accountId===identifier);
}

$("#register").onclick=()=>{
  const email=$("#email").value.trim().toLowerCase(), password=$("#password").value, name=$("#name").value.trim();
  if(!email||!password||!name)return $("#authMsg").textContent="Completá todos los campos.";
  if(Object.values(state.users).some(u=>u.email===email))return $("#authMsg").textContent="Ese email ya está registrado.";
  const id=uid(), alias=name.toLowerCase().replace(/[^a-z0-9]+/g,".").replace(/^\.|\.$/g,"")+"."+Math.floor(Math.random()*900+100);
  state.users[id]={id,email,password,name,alias,accountId:"GB"+Math.floor(100000000000+Math.random()*899999999999),balance:100000};
  state.movements[id]=[];
  state.session=id; save(); render();
};
$("#login").onclick=()=>{
  const email=$("#email").value.trim().toLowerCase(), password=$("#password").value;
  const u=Object.values(state.users).find(x=>x.email===email&&x.password===password);
  if(!u)return $("#authMsg").textContent="Email o contraseña incorrectos.";
  state.session=u.id;save();render();
};
$("#logout").onclick=()=>{state.session=null;save();render()};
$("#copyAlias").onclick=()=>navigator.clipboard?.writeText(current().alias);

function form(type){
  const op=$("#operation");op.hidden=false;
  const title={send:"Enviar dinero",receive:"Recibir dinero",pay:"Pagar"}[type];
  if(type==="receive"){
    op.innerHTML=`<div class="section-title"><h2>Recibir dinero</h2></div><p>Compartí tu alias para que otro usuario te envíe dinero.</p><div class="receipt"><b>${current().alias}</b><br>${current().accountId}</div><button class="primary" id="closeOp">Cerrar</button>`;
    $("#closeOp").onclick=()=>op.hidden=true;return;
  }
  op.innerHTML=`<div class="section-title"><h2>${title}</h2></div>
    <div class="operation-grid">
      <input id="to" class="wide" placeholder="Alias, email o cuenta GESBANK">
      <input id="amount" type="number" min="0.01" step="0.01" placeholder="Importe en ARS">
      <input id="concept" placeholder="Concepto">
      <button class="primary wide" id="confirm">Confirmar operación</button>
    </div><p id="opMsg" class="msg"></p>`;
  $("#confirm").onclick=()=>operate(type);
}
function operate(type){
  const me=current(), target=findUser($("#to").value.trim()), amount=Number($("#amount").value), concept=$("#concept").value.trim()||"Operación GESBANK";
  if(!target)return $("#opMsg").textContent="No encontramos esa cuenta GESBANK.";
  if(target.id===me.id)return $("#opMsg").textContent="No podés enviarte dinero a vos mismo.";
  if(!Number.isFinite(amount)||amount<=0)return $("#opMsg").textContent="Ingresá un importe válido.";
  if(amount>me.balance)return $("#opMsg").textContent="Saldo insuficiente.";
  me.balance-=amount;target.balance+=amount;
  addMovement(me.id,{type:"debit",title:type==="pay"?"Pago realizado":"Transferencia enviada",detail:`${target.name} · ${concept}`,amount});
  addMovement(target.id,{type:"credit",title:"Transferencia recibida",detail:`${me.name} · ${concept}`,amount});
  save();
  const receipt=`<div class="receipt"><h3>✓ Operación realizada</h3><p><b>Comprobante:</b> ${uid().slice(0,8).toUpperCase()}</p><p><b>Importe:</b> ${money(amount)}</p><p><b>Destino:</b> ${target.alias}</p><p><b>Concepto:</b> ${concept}</p><p><b>Fecha:</b> ${now()}</p></div><button class="primary" id="closeOp">Listo</button>`;
  $("#operation").innerHTML=receipt;$("#closeOp").onclick=()=>{$("#operation").hidden=true;render()};
  render();
}
document.querySelectorAll("[data-action]").forEach(b=>b.onclick=()=>form(b.dataset.action));
$("#allMovements").onclick=()=>{
  const u=current(), op=$("#operation");op.hidden=false;
  op.innerHTML='<h2>Todos los movimientos</h2>'+((state.movements[u.id]||[]).slice().reverse().map(m=>`<p><b>${m.title}</b> · ${m.detail||""} · ${m.type==="credit"?"+":"-"}${money(m.amount)} · ${m.date}</p>`).join("")||"<p>No hay movimientos.</p>")+`<button class="primary" id="closeOp">Cerrar</button>`;
  $("#closeOp").onclick=()=>op.hidden=true;
};
render();
