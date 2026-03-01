import React, { useState, useMemo } from 'react';
import { 
  Settings, 
  GraduationCap, 
  RotateCcw, 
  Target, 
  BookOpen, 
  Menu, 
  Plus, 
  Trash2, 
  X, 
  Edit2, 
  Check, 
  Save, 
  BarChart2, 
  ChevronRight, 
  Moon, 
  Sun 
} from 'lucide-react';

export default function App() {
  // --- ESTADOS ---
  const [courses, setCourses] = useState([]);
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [showCourseList, setShowCourseList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // --- LOGICA DE CURSO ACTIVO (MEMOIZADA PARA ESTABILIDAD) ---
  const activeCourse = useMemo(() => {
    const raw = courses.find(c => c.id === activeCourseId) || (courses.length > 0 ? courses[0] : null);
    if (!raw) return null;
    return {
      ...raw,
      labels: raw.labels || { c1: 'C1', ep: 'EP', c2: 'C2', ef: 'EF' },
      weights: raw.weights || { c1: 20, ep: 25, c2: 20, ef: 35 },
      grades: raw.grades || { c1: '', ep: '', c2: '', ef: '' },
      minPassingGrade: raw.minPassingGrade ?? 11,
      maxGrade: raw.maxGrade ?? 20
    };
  }, [courses, activeCourseId]);

  // --- FUNCIONES DE ACCIÓN ---
  const updateCourse = (updates) => {
    if (!activeCourseId) return;
    setCourses(prev => prev.map(c => c.id === activeCourseId ? { ...c, ...updates } : c));
  };

  const addNewCourse = () => {
    const newId = Date.now();
    const newCourse = {
      id: newId,
      name: `Nuevo Curso`,
      labels: { c1: 'C1', ep: 'EP', c2: 'C2', ef: 'EF' },
      weights: { c1: 20, ep: 25, c2: 20, ef: 35 },
      grades: { c1: '', ep: '', c2: '', ef: '' },
      minPassingGrade: 11,
      maxGrade: 20
    };
    setCourses([...courses, newCourse]);
    setActiveCourseId(newId);
    setShowCourseList(false);
    setShowSettings(true);
  };

  const deleteCourse = (e, id) => {
    e.stopPropagation();
    const filtered = courses.filter(c => c.id !== id);
    setCourses(filtered);
    if (activeCourseId === id) {
      setActiveCourseId(filtered.length > 0 ? filtered[0].id : null);
    }
  };

  const handleGradeChange = (key, val) => {
    if (!activeCourse) return;
    if (val === '' || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= activeCourse.maxGrade)) {
      updateCourse({ grades: { ...activeCourse.grades, [key]: val } });
    }
  };

  const resetGrades = () => {
    if (!activeCourse) return;
    updateCourse({ grades: { c1: '', ep: '', c2: '', ef: '' } });
  };

  // --- CÁLCULOS ---
  const finalScore = useMemo(() => {
    if (!activeCourse) return "0.00";
    const { grades, weights } = activeCourse;
    const score = (parseFloat(grades.c1 || 0) * (weights.c1 / 100)) +
                  (parseFloat(grades.ep || 0) * (weights.ep / 100)) +
                  (parseFloat(grades.c2 || 0) * (weights.c2 / 100)) +
                  (parseFloat(grades.ef || 0) * (weights.ef / 100));
    return score.toFixed(2);
  }, [activeCourse]);

  const projection = useMemo(() => {
    if (!activeCourse || activeCourse.grades.ef !== '') return null;
    const { grades, weights, minPassingGrade, maxGrade } = activeCourse;
    const current = (parseFloat(grades.c1 || 0) * (weights.c1 / 100)) +
                    (parseFloat(grades.ep || 0) * (weights.ep / 100)) +
                    (parseFloat(grades.c2 || 0) * (weights.c2 / 100));
    const needed = (minPassingGrade - current) / (weights.ef / 100);

    if (needed <= 0) return { text: "¡Aprobado!", subtext: "Meta superada", color: "text-emerald-500", progress: 100 };
    if (needed > maxGrade) return { text: "Imposible", subtext: "Fuera de escala", color: "text-red-500", progress: 0 };
    return { 
      text: `Necesitas: ${needed.toFixed(2)}`, 
      subtext: `En el ${activeCourse.labels.ef}`, 
      color: darkMode ? "text-blue-400" : "text-blue-600",
      progress: (needed / maxGrade) * 100 
    };
  }, [activeCourse, darkMode]);

  // --- VISTA: BIENVENIDA ---
  if (!activeCourse) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-8 transition-colors ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className={`w-full max-w-sm p-10 rounded-3xl border shadow-2xl transition-colors ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 rotate-3 shadow-xl shadow-blue-900/20">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black mb-3">Continental App</h1>
          <p className={`text-sm mb-10 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Optimizado para Ingeniería de Sistemas. Control total de tus notas.</p>
          <button 
            onClick={addNewCourse}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-600/20"
          >
            Añadir Primer Curso
          </button>
        </div>
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className={`mt-8 p-4 rounded-full border ${darkMode ? 'bg-slate-800 border-slate-700 text-yellow-400' : 'bg-white border-slate-200 text-slate-600'}`}
        >
          {darkMode ? <Sun /> : <Moon />}
        </button>
        <div className="mt-12 text-center opacity-30">
          <span className={`text-2xl font-black italic tracking-tighter ${darkMode ? 'text-slate-700' : 'text-slate-300'}`}>RomarioTec</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* SIDEBAR */}
      {showCourseList && (
        <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCourseList(false)} />
          <div className={`relative w-80 h-full shadow-2xl flex flex-col border-r transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className={`p-8 pt-20 border-b flex items-center justify-between ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <h2 className="font-black uppercase tracking-tighter text-xl">Mis Materias</h2>
              <button onClick={() => setShowCourseList(false)} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}><X /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {courses.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => { setActiveCourseId(c.id); setShowCourseList(false); }}
                  className={`p-4 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${activeCourseId === c.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : (darkMode ? 'border-slate-800 hover:border-blue-500' : 'border-transparent hover:border-blue-500')}`}
                >
                  <span className="font-bold truncate pr-2">{c.name}</span>
                  <button onClick={(e) => deleteCourse(e, c.id)} className="p-2 opacity-50 hover:opacity-100 hover:bg-red-500 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            {/* BOTÓN REPARADO: "Nueva Asignatura" ahora tiene colores fijos para visibilidad en modo oscuro */}
            <div className="p-6 pb-12">
              <button 
                onClick={addNewCourse} 
                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                  darkMode 
                    ? 'bg-slate-800 text-white hover:bg-blue-600' 
                    : 'bg-slate-200 text-slate-900 hover:bg-blue-600 hover:text-white'
                }`}
              >
                <Plus className="w-5 h-5" /> Nueva Asignatura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <div className={`sticky top-0 z-30 h-24 pt-8 px-4 border-b backdrop-blur-md flex items-center justify-between transition-colors ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <button onClick={() => setShowCourseList(true)} className={`p-3 rounded-xl transition-all ${darkMode ? 'hover:bg-slate-800 text-white' : 'hover:bg-slate-100 text-slate-600'}`}><Menu /></button>
        
        <div className="flex-1 text-center px-2">
          {isEditingName ? (
            <div className="flex items-center justify-center gap-2">
              <input 
                autoFocus
                className={`w-full max-w-[160px] text-center font-black bg-transparent border-b-2 outline-none py-1 ${darkMode ? 'text-white border-blue-500' : 'text-slate-800 border-blue-600'}`}
                value={activeCourse.name}
                onChange={(e) => updateCourse({ name: e.target.value })}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
              />
              <button onClick={() => setIsEditingName(false)} className="text-emerald-500"><Check /></button>
            </div>
          ) : (
            <div onClick={() => setIsEditingName(true)} className="flex flex-col items-center cursor-pointer group">
              <h1 className="text-lg font-black uppercase tracking-tighter truncate max-w-[180px] group-hover:text-blue-500 transition-colors">{activeCourse.name}</h1>
              <span className="text-[8px] font-bold tracking-[0.4em] opacity-40 uppercase">Ingeniería Continental</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => setDarkMode(!darkMode)} className={`p-3 rounded-xl transition-all ${darkMode ? 'text-yellow-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}>
            {darkMode ? <Sun /> : <Moon />}
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className={`p-3 rounded-xl transition-all ${showSettings ? 'bg-blue-600 text-white' : (darkMode ? 'hover:bg-slate-800 text-white' : 'hover:bg-slate-100 text-slate-600')}`}>
            <Settings />
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-xl mx-auto p-6 pt-8 pb-40 space-y-8">
        
        {/* PANEL CONFIGURACION */}
        {showSettings && (
          <div className={`p-8 rounded-3xl shadow-2xl border animate-in slide-in-from-top-4 duration-300 transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-xs tracking-widest uppercase opacity-50">Configuración de Fórmula</h3>
              <button onClick={() => setShowSettings(false)} className="p-2"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-8">
              {['c1', 'ep', 'c2', 'ef'].map(key => (
                <div key={key} className="space-y-3">
                  <input 
                    className={`w-full text-[10px] text-center font-black uppercase bg-transparent outline-none focus:text-blue-500 transition-colors ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}
                    value={activeCourse.labels[key]}
                    onChange={(e) => updateCourse({ labels: { ...activeCourse.labels, [key]: e.target.value } })}
                  />
                  <div className="relative">
                    <input 
                      type="number"
                      className={`w-full p-3 rounded-xl text-center font-black text-sm outline-none transition-all ${darkMode ? 'bg-slate-800 text-white focus:ring-2 focus:ring-blue-500' : 'bg-slate-100 text-slate-900 focus:ring-2 focus:ring-blue-600'}`}
                      value={activeCourse.weights[key]}
                      onChange={(e) => updateCourse({ weights: { ...activeCourse.weights, [key]: parseFloat(e.target.value) || 0 } })}
                    />
                    <span className="absolute right-2 top-3.5 text-[8px] font-bold opacity-30">%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 mb-8">
              <div className="flex-1 space-y-2">
                <span className="text-[10px] font-black uppercase opacity-40">Mínima</span>
                <input 
                  type="number" 
                  className={`w-full p-4 rounded-2xl text-center font-black outline-none ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900'}`} 
                  value={activeCourse.minPassingGrade}
                  onChange={(e) => updateCourse({ minPassingGrade: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="flex-1 space-y-2">
                <span className="text-[10px] font-black uppercase opacity-40">Escala Máx.</span>
                <input 
                  type="number" 
                  className={`w-full p-4 rounded-2xl text-center font-black outline-none ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900'}`} 
                  value={activeCourse.maxGrade}
                  onChange={(e) => updateCourse({ maxGrade: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <button 
              onClick={() => setShowSettings(false)}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
            >
              Guardar Cambios
            </button>
          </div>
        )}

        {/* DASHBOARD DE NOTAS */}
        <div className="grid grid-cols-2 gap-4">
          {['c1', 'ep', 'c2', 'ef'].map(key => (
            <div key={key} className={`p-6 rounded-3xl border transition-all relative overflow-hidden group ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} ${key === 'ef' && activeCourse.grades.ef === '' ? 'border-blue-500/50 ring-2 ring-blue-500/5' : ''}`}>
              <div className={`absolute top-0 left-0 h-1.5 w-full ${activeCourse.grades[key] !== '' ? 'bg-emerald-500' : (darkMode ? 'bg-slate-700' : 'bg-slate-100')}`} />
              <div className="flex justify-between items-center mb-6">
                <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider ${key === 'ef' ? 'bg-blue-600 text-white' : (darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500')}`}>
                  {activeCourse.labels[key]}
                </span>
                <span className="text-[10px] font-black opacity-30">{activeCourse.weights[key]}%</span>
              </div>
              <input 
                type="number"
                placeholder="00"
                className={`w-full text-4xl font-black text-center bg-transparent outline-none font-mono tracking-tighter ${darkMode ? 'text-white placeholder-slate-800' : 'text-slate-900 placeholder-slate-200'}`}
                value={activeCourse.grades[key]}
                onChange={(e) => handleGradeChange(key, e.target.value)}
              />
            </div>
          ))}
        </div>

        {/* RESULTADOS */}
        <div className="space-y-4">
          <div className={`p-8 rounded-3xl border flex items-center justify-between relative overflow-hidden transition-all ${darkMode ? 'bg-slate-900 border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 block mb-2">Promedio Final</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-6xl font-black tracking-tighter ${parseFloat(finalScore) < activeCourse.minPassingGrade ? 'text-red-500' : 'text-emerald-500'}`}>
                  {finalScore}
                </span>
                <span className="text-xl font-bold opacity-20">/ {activeCourse.maxGrade}</span>
              </div>
            </div>
            <BarChart2 className={`w-16 h-16 absolute right-[-10px] bottom-[-10px] rotate-12 transition-colors ${darkMode ? 'text-slate-800' : 'text-slate-100'}`} />
          </div>

          {projection && (
            <div className={`p-8 rounded-3xl border-2 animate-in zoom-in-95 duration-500 ${projection.color.replace('text', 'border')}/20 ${darkMode ? 'bg-slate-900/50' : 'bg-white shadow-sm'}`}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${projection.color}`}>Proyección Académica</span>
                  <h3 className={`text-3xl font-black mt-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{projection.text}</h3>
                  <p className="text-xs font-bold opacity-40 mt-1">{projection.subtext}</p>
                </div>
                <div className={`p-3 rounded-2xl ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900'}`}>
                  <Target className={`w-6 h-6 ${projection.color}`} />
                </div>
              </div>
              {projection.progress > 0 && projection.progress <= 100 && (
                <div className="h-2 w-full bg-slate-800/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-1000 ${projection.color.replace('text', 'bg')}`} style={{ width: `${projection.progress}%` }} />
                </div>
              )}
            </div>
          )}
        </div>

        <button 
          onClick={resetGrades}
          className={`w-full py-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 active:scale-95 ${darkMode ? 'text-slate-500 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
        >
          <RotateCcw className="w-4 h-4" /> Reiniciar Curso
        </button>

        {/* FIRMA */}
        <div className="pt-12 flex justify-center opacity-40">
           <span className={`text-4xl font-black italic tracking-tighter transition-colors ${darkMode ? 'text-slate-800' : 'text-slate-200'}`}>
             RomarioTec
           </span>
        </div>

      </main>
    </div>
  );
}