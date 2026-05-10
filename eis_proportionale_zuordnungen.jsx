import { useState } from "react";

const K = 3.5;
const BECHER_DATA = [
  { x: 0, y: 0 }, { x: 1, y: 3.5 }, { x: 2, y: 7.0 },
  { x: 3, y: 10.5 }, { x: 4, y: 14.0 }, { x: 5, y: 17.5 }, { x: 6, y: 21.0 },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function CoordSystem({ revealedCount }) {
  const VW = 500, VH = 360;
  const L = 65, R = 470, B = 310, T = 20;
  const xs = v => L + (v / 7) * (R - L);
  const ys = v => B - (v / 25) * (B - T);
  const xTicks = [0,1,2,3,4,5,6];
  const yTicks = [0,5,10,15,20,25];
  const visible = BECHER_DATA.slice(0, revealedCount);
  const last = visible[visible.length - 1];

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full">
      {xTicks.map(x => <line key={`xg${x}`} x1={xs(x)} y1={T} x2={xs(x)} y2={B} stroke="#e5e7eb" strokeWidth="1"/>)}
      {yTicks.map(y => <line key={`yg${y}`} x1={L} y1={ys(y)} x2={R} y2={ys(y)} stroke="#e5e7eb" strokeWidth="1"/>)}
      <line x1={L} y1={T-5} x2={L} y2={B} stroke="#374151" strokeWidth="2.5"/>
      <line x1={L} y1={B} x2={R+5} y2={B} stroke="#374151" strokeWidth="2.5"/>
      <polygon points={`${L-5},${T+6} ${L+5},${T+6} ${L},${T-4}`} fill="#374151"/>
      <polygon points={`${R-6},${B-5} ${R-6},${B+5} ${R+4},${B}`} fill="#374151"/>
      {xTicks.map(x => (
        <g key={`xl${x}`}>
          <line x1={xs(x)} y1={B-4} x2={xs(x)} y2={B+4} stroke="#374151" strokeWidth="1.5"/>
          <text x={xs(x)} y={B+20} textAnchor="middle" fontSize="13" fill="#4b5563" fontFamily="Arial">{x}</text>
        </g>
      ))}
      {yTicks.filter(y => y > 0).map(y => (
        <g key={`yl${y}`}>
          <line x1={L-4} y1={ys(y)} x2={L+4} y2={ys(y)} stroke="#374151" strokeWidth="1.5"/>
          <text x={L-10} y={ys(y)+4} textAnchor="end" fontSize="13" fill="#4b5563" fontFamily="Arial">{y}</text>
        </g>
      ))}
      <text x={(L+R)/2} y={VH-4} textAnchor="middle" fontSize="13" fill="#374151" fontFamily="Arial" fontWeight="bold">Anzahl Becher (x)</text>
      <text x={12} y={(T+B)/2} textAnchor="middle" fontSize="13" fill="#374151" fontFamily="Arial" fontWeight="bold"
        transform={`rotate(-90,12,${(T+B)/2})`}>Preis in € (y)</text>
      {visible.length >= 2 && last && (
        <line x1={xs(0)} y1={ys(0)} x2={xs(last.x)} y2={ys(last.y)}
          stroke="#3b82f6" strokeWidth="2.5"
          strokeDasharray={revealedCount >= 7 ? "0" : "7,4"}
          opacity="0.55"/>
      )}
      {visible.map(d => (
        <g key={d.x}>
          <circle cx={xs(d.x)} cy={ys(d.y)} r="8" fill="#2563eb" opacity="0.9"/>
          <circle cx={xs(d.x)} cy={ys(d.y)} r="3.5" fill="white"/>
          {revealedCount <= 5 && d.x > 0 && (
            <text x={xs(d.x)+13} y={ys(d.y)-7} fontSize="11" fill="#1d4ed8" fontFamily="Arial">
              ({d.x}|{d.y % 1 === 0 ? d.y : d.y.toFixed(1)})
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

function EPhase({ onComplete }) {
  const BECHER = [1,2,3,4,5,6];
  const [prices]  = useState(() => shuffle(BECHER.map(b => b * K)));
  const [sel, setSel]         = useState(null);
  const [matched, setMatched] = useState({});
  const [flash, setFlash]     = useState(null);
  const [open, setOpen]       = useState(false);

  const isBM = b => matched[b] !== undefined;
  const isPM = p => Object.values(matched).some(v => Math.abs(v-p) < 0.01);
  const done  = Object.keys(matched).length === 6;

  const pickB = b => { if (isBM(b)) return; setSel(s => s===b?null:b); };
  const pickP = p => {
    if (isPM(p)||sel===null) return;
    if (Math.abs(sel*K-p)<0.01) { setMatched(m=>({...m,[sel]:p})); setSel(null); }
    else { setFlash(sel); setTimeout(()=>{setFlash(null);setSel(null);},700); }
  };

  return (
    <div>
      <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
        <p className="font-semibold text-amber-900 text-sm">🧋 Ein Becher Bubble Tea kostet <span className="text-lg font-bold">3,50 €</span></p>
        <p className="text-amber-800 text-xs mt-1">Klicke zuerst auf eine <strong>Anzahl</strong> (links), dann auf den passenden <strong>Preis</strong> (rechts).</p>
      </div>
      {sel!==null && (
        <div className="mb-3 py-2 px-3 bg-amber-100 rounded-xl text-center text-amber-800 text-sm font-semibold border border-amber-300">
          {sel} Becher gewählt → welcher Preis passt?
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="space-y-2">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Anzahl Becher</p>
          {BECHER.map(b => {
            const d=isBM(b), a=sel===b, e=flash===b;
            return (
              <button key={b} onClick={()=>pickB(b)} disabled={d}
                className={`w-full py-3 rounded-xl font-bold text-base border-2 transition-all select-none
                  ${d?'bg-emerald-100 border-emerald-400 text-emerald-700 cursor-default':
                    e?'bg-red-100 border-red-400 text-red-700 scale-95 duration-75':
                    a?'bg-amber-400 border-amber-500 text-white shadow-md scale-105':
                    'bg-white border-gray-200 text-gray-700 hover:border-amber-400 hover:bg-amber-50 cursor-pointer'}`}>
                {b} Becher {d?'✓':''}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Preis in €</p>
          {prices.map(p => {
            const d=isPM(p), dis=d||sel===null;
            return (
              <button key={p} onClick={()=>pickP(p)} disabled={dis}
                className={`w-full py-3 rounded-xl font-bold text-base border-2 transition-all select-none
                  ${d?'bg-emerald-100 border-emerald-400 text-emerald-700 cursor-default':
                    dis?'bg-gray-50 border-gray-200 text-gray-400 cursor-default':
                    'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'}`}>
                {p.toFixed(2).replace('.',',')} € {d?'✓':''}
              </button>
            );
          })}
        </div>
      </div>

      {done && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 space-y-3">
          <p className="font-bold text-emerald-800">🎉 Alle 6 Paare richtig!</p>
          <p className="text-emerald-700 text-sm">Was bekommst du, wenn du <strong>Preis ÷ Anzahl</strong> rechnest?</p>
          <div className="grid grid-cols-3 gap-2">
            {BECHER.map(b=>(
              <div key={b} className="bg-white rounded-xl p-2 text-center border border-emerald-200">
                <div className="text-xs text-gray-500">{(b*K).toFixed(2).replace('.',',')} ÷ {b}</div>
                <div className={`font-bold text-sm mt-0.5 rounded transition-all ${open?'text-emerald-700':'bg-gray-200 text-gray-200'}`}>= 3,50</div>
              </div>
            ))}
          </div>
          {!open
            ? <button onClick={()=>setOpen(true)}
                className="w-full py-2 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition">
                🔍 Ergebnisse aufdecken
              </button>
            : <div className="space-y-2">
                <div className="bg-white border-2 border-emerald-500 rounded-xl p-3 text-center">
                  <p className="font-bold text-emerald-900 text-base">Preis ÷ Anzahl = immer <span className="text-2xl font-black">3,50</span></p>
                  <p className="text-sm text-gray-600 mt-1">→ Das ist der <strong>Proportionalitätsfaktor k</strong></p>
                </div>
                <button onClick={onComplete}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">
                  Weiter zur I-Phase (Tabelle & Graph) →
                </button>
              </div>
          }
        </div>
      )}
    </div>
  );
}

function IPhase({ onComplete }) {
  const EXP = { 2:7.0, 3:10.5, 4:14.0, 5:17.5, 6:21.0 };
  const [vals, setVals]         = useState({2:'',3:'',4:'',5:'',6:''});
  const [checked, setChecked]   = useState({});
  const [graphOn, setGraphOn]   = useState(false);
  const [revealed, setRevealed] = useState(0);

  const allOk   = Object.keys(EXP).every(x=>checked[x]===true);
  const hasChk  = Object.keys(checked).length > 0;

  const doCheck = () => {
    const res={}; let ok=true;
    Object.entries(EXP).forEach(([x,exp])=>{
      const n=parseFloat(String(vals[x]).replace(',','.'));
      const right=!isNaN(n)&&Math.abs(n-exp)<0.11;
      res[x]=right; if(!right) ok=false;
    });
    setChecked(res);
    if(ok){ setGraphOn(true); setRevealed(r=>Math.max(r,2)); }
  };

  const addPoint = ()=>setRevealed(r=>Math.min(r+1,7));

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
        <p className="font-semibold text-blue-900 text-sm">📊 Von den Karten zur Tabelle und zum Graphen!</p>
        <p className="text-blue-800 text-xs mt-1">Tipp: Anzahl × 3,50 rechnen.</p>
      </div>

      <div>
        <p className="font-bold text-gray-700 text-sm mb-2">① Wertetabelle ausfüllen</p>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="text-sm w-full border-collapse">
            <thead className="bg-blue-50">
              <tr>
                <td className="px-3 py-2 font-semibold text-blue-800 text-center border-r border-blue-200 text-xs">Becher (x)</td>
                {[0,1,2,3,4,5,6].map(x=>(
                  <td key={x} className="px-2 py-2 font-bold text-blue-900 text-center border-r border-blue-200 last:border-0">{x}</td>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-2 py-2 font-semibold text-gray-600 text-center bg-gray-50 border-r border-gray-200 text-xs leading-tight">Preis<br/>€ (y)</td>
                <td className="px-2 py-2 text-center font-bold text-blue-600 border-r border-gray-200">0</td>
                <td className="px-2 py-2 text-center font-bold text-blue-600 border-r border-gray-200">3,50</td>
                {[2,3,4,5,6].map(x=>(
                  <td key={x} className="px-1 py-1 text-center border-r border-gray-200 last:border-0">
                    <input type="text" inputMode="decimal" value={vals[x]}
                      onChange={e=>{setVals(v=>({...v,[x]:e.target.value}));setChecked(c=>{const n={...c};delete n[x];return n;});}}
                      className={`w-14 text-center font-bold rounded-lg border-2 py-1 text-sm outline-none transition
                        ${checked[x]===true?'border-emerald-400 bg-emerald-50 text-emerald-700':
                          checked[x]===false?'border-red-400 bg-red-50 text-red-700':
                          'border-gray-300 focus:border-blue-500'}`}
                      placeholder="?"/>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <button onClick={doCheck}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition">
          Überprüfen ✓
        </button>
        {hasChk&&!allOk&&<p className="mt-1 text-red-600 text-xs">❌ Nicht alle stimmen. Tipp: Anzahl × 3,50</p>}
        {allOk&&<p className="mt-1 text-emerald-600 font-semibold text-xs">✓ Alle Werte richtig!</p>}
      </div>

      {graphOn && (
        <div className="space-y-3">
          <p className="font-bold text-gray-700 text-sm">② Punkte ins Koordinatensystem eintragen</p>
          <div className="bg-white border border-gray-200 rounded-2xl p-2 overflow-x-auto">
            <CoordSystem revealedCount={revealed}/>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {revealed<7
              ? <button onClick={addPoint}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition">
                  + Punkt ({revealed} | {(revealed*K).toFixed(1).replace('.',',')}) einzeichnen
                </button>
              : <p className="text-emerald-600 font-semibold text-sm">✓ Alle 7 Punkte eingezeichnet!</p>
            }
          </div>
          {revealed>=7&&(
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 space-y-2">
              <p className="font-bold text-indigo-900 text-sm">🔍 Was fällt dir am Graphen auf?</p>
              <div className="text-sm text-indigo-800 space-y-1">
                <p>✓ Alle Punkte liegen auf einer <strong>geraden Linie</strong></p>
                <p>✓ Die Linie geht durch den <strong>Nullpunkt (0|0)</strong></p>
                <p>✓ Das ist typisch für <strong>proportionale Zuordnungen</strong>!</p>
              </div>
              <button onClick={onComplete}
                className="w-full py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition">
                Weiter zur S-Phase (Formel) →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SPhase() {
  const EX = [
    { q:"Wie viel kosten 8 Becher?",                        ans:28.0, ph:"Preis in €", hint:"y = 3,50 · 8" },
    { q:"Wie viel kosten 11 Becher?",                       ans:38.5, ph:"Preis in €", hint:"y = 3,50 · 11" },
    { q:"Für 17,50 € – wie viele Becher kann man kaufen?",  ans:5,    ph:"Anzahl",    hint:"x = 17,50 ÷ 3,50" },
  ];
  const [answers, setAnswers] = useState(['','','']);
  const [results, setResults] = useState([null,null,null]);

  const check = i => {
    const v=parseFloat(String(answers[i]).replace(',','.'));
    const ok=!isNaN(v)&&Math.abs(v-EX[i].ans)<0.11;
    setResults(r=>{const n=[...r];n[i]=ok;return n;});
  };

  const allRight = results.every(r=>r===true);

  return (
    <div className="space-y-4">
      <div className="bg-violet-50 border-2 border-violet-200 rounded-2xl p-5">
        <p className="text-xs font-bold text-violet-500 uppercase tracking-widest text-center mb-3">Formel für proportionale Zuordnungen</p>
        <div className="text-5xl font-black text-violet-800 text-center tracking-tight">y = k · x</div>
        <div className="grid grid-cols-3 gap-2 mt-4 text-center text-sm">
          <div className="bg-white rounded-xl p-2 border border-violet-100">
            <div className="font-black text-violet-700 text-xl">y</div>
            <div className="text-gray-500 text-xs">Preis in €</div>
          </div>
          <div className="bg-amber-100 rounded-xl p-2 border border-amber-300">
            <div className="font-black text-amber-700 text-base">k = 3,50</div>
            <div className="text-gray-500 text-xs">Proportionalitätsfaktor</div>
          </div>
          <div className="bg-white rounded-xl p-2 border border-violet-100">
            <div className="font-black text-violet-700 text-xl">x</div>
            <div className="text-gray-500 text-xs">Anzahl Becher</div>
          </div>
        </div>
        <div className="mt-4 bg-white rounded-xl p-3 border border-violet-100">
          <p className="text-xs text-gray-500">Beispiel: 4 Becher</p>
          <p className="font-bold text-violet-800 text-lg">y = 3,50 · 4 = <span className="text-2xl font-black">14,00 €</span></p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        <p className="font-bold text-gray-700 text-sm mb-2">📋 Wann ist eine Zuordnung proportional?</p>
        <div className="space-y-1.5 text-sm text-gray-700">
          <p>✅ Tabelle: <strong>y ÷ x ergibt immer dieselbe Zahl</strong> (= k)</p>
          <p>✅ Graph: <strong>gerade Linie durch den Nullpunkt</strong> (0|0)</p>
          <p>✅ x doppelt so groß → <strong>y auch doppelt so groß</strong></p>
        </div>
      </div>

      <div>
        <p className="font-bold text-gray-700 text-sm mb-3">Jetzt du! Rechne mit y = k · x</p>
        <div className="space-y-3">
          {EX.map((ex,i)=>(
            <div key={i} className={`rounded-2xl border-2 p-4 transition-all
              ${results[i]===true?'border-emerald-400 bg-emerald-50':
                results[i]===false?'border-red-300 bg-red-50':
                'border-gray-200 bg-white'}`}>
              <p className="font-semibold text-gray-800 text-sm mb-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-violet-600 text-white text-xs font-black mr-2">{i+1}</span>
                {ex.q}
              </p>
              <div className="flex flex-wrap gap-2 items-center">
                <input type="text" inputMode="decimal" value={answers[i]} placeholder={ex.ph}
                  onChange={e=>{setAnswers(a=>{const n=[...a];n[i]=e.target.value;return n;});setResults(r=>{const n=[...r];n[i]=null;return n;});}}
                  onKeyDown={e=>e.key==='Enter'&&check(i)}
                  className={`w-32 text-center font-bold rounded-xl border-2 py-2 text-sm outline-none transition
                    ${results[i]===true?'border-emerald-400 text-emerald-700':
                      results[i]===false?'border-red-400 text-red-700':
                      'border-gray-300 focus:border-violet-500'}`}/>
                <button onClick={()=>check(i)}
                  className="px-3 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition">
                  Prüfen
                </button>
                {results[i]===true&&<span className="text-emerald-700 font-bold text-sm">✓ Richtig!</span>}
                {results[i]===false&&<span className="text-red-600 text-sm">✗ Tipp: {ex.hint}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {allRight&&(
        <div className="border-2 border-emerald-400 rounded-2xl p-5 text-center bg-emerald-50">
          <div className="text-4xl mb-2">🏆</div>
          <p className="font-black text-xl text-emerald-800">Alle 3 Phasen abgeschlossen!</p>
          <div className="mt-4 bg-white rounded-xl p-4 border border-emerald-200 text-left text-sm space-y-1.5">
            <p className="font-bold text-gray-800 mb-1">📒 Für deinen Hefteintrag:</p>
            <p><strong>Proportional</strong> = y ÷ x ist immer gleich (= k)</p>
            <p><strong>Formel:</strong> y = k · x</p>
            <p><strong>Graph:</strong> Gerade Linie durch den Nullpunkt (0|0)</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [phase, setPhase]       = useState(0);
  const [unlocked, setUnlocked] = useState([true,false,false]);

  const PHASES = [
    { id:'E', name:'Enaktiv',    sub:'Karten zuordnen',  activeBg:'bg-amber-500',  lightBg:'bg-amber-50',   border:'border-amber-300',  text:'text-amber-700'  },
    { id:'I', name:'Ikonisch',   sub:'Tabelle & Graph',  activeBg:'bg-blue-600',   lightBg:'bg-blue-50',    border:'border-blue-300',   text:'text-blue-700'   },
    { id:'S', name:'Symbolisch', sub:'Formel & Rechnen', activeBg:'bg-violet-600', lightBg:'bg-violet-50',  border:'border-violet-300', text:'text-violet-700' },
  ];

  const unlock = idx => {
    setUnlocked(u=>{const n=[...u];n[idx]=true;return n;});
    setPhase(idx);
  };

  const p = PHASES[phase];
  const progress = unlocked.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-100 py-5 px-3">
      <div className="max-w-xl mx-auto space-y-4">

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 text-center">
          <div className="text-4xl mb-1">🧋</div>
          <h1 className="text-xl font-black text-gray-900">Proportionale Zuordnungen</h1>
          <p className="text-xs text-gray-500 mt-0.5">EIS-Lernpfad · Klasse 8 · Mathematik Bayern</p>
          <div className="flex gap-1.5 mt-4 px-2">
            {[0,1,2].map(i=>(
              <div key={i} className={`h-2.5 flex-1 rounded-full transition-all duration-500
                ${i<progress?'bg-emerald-400':i===progress-1?'bg-emerald-300':'bg-gray-200'}`}/>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1.5">{progress}/3 Phasen abgeschlossen</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {PHASES.map((ph,i)=>{
            const active=phase===i, locked=!unlocked[i];
            return (
              <button key={i} onClick={()=>!locked&&setPhase(i)} disabled={locked}
                className={`rounded-2xl py-3 px-2 text-center border-2 transition-all select-none
                  ${active?`${ph.activeBg} border-transparent text-white shadow-md scale-105`:
                    locked?'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed':
                    `${ph.lightBg} ${ph.border} ${ph.text} cursor-pointer hover:scale-102`}`}>
                <div className="text-2xl font-black">{ph.id}</div>
                <div className="text-xs font-bold leading-tight mt-0.5">{ph.name}</div>
                {locked
                  ? <div className="text-xs mt-0.5 opacity-60">🔒 gesperrt</div>
                  : <div className="text-xs opacity-75">{ph.sub}</div>
                }
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
          <div className="mb-4 pb-3 border-b border-gray-100 flex items-baseline gap-2">
            <span className={`text-xl font-black ${p.text}`}>{p.id}-Phase</span>
            <span className="text-gray-500 text-sm">{p.sub}</span>
          </div>
          {phase===0&&<EPhase onComplete={()=>unlock(1)}/>}
          {phase===1&&<IPhase onComplete={()=>unlock(2)}/>}
          {phase===2&&<SPhase/>}
        </div>

        <p className="text-center text-xs text-gray-400 pb-2">LehrplanPLUS Bayern · Klasse 8 · Proportionale Zuordnungen</p>
      </div>
    </div>
  );
}
