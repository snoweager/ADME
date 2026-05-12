import { useState, ReactNode } from "react";
import { 
  Search, 
  Activity, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  FlaskConical, 
  Dna, 
  Loader2,
  Droplets,
  Zap,
  Info,
  Database
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { fetchDrugFromPubChem, PubChemCompound } from "./services/pubchemService";
import { analyzeDrugADMET, ADMETProfile } from "./services/geminiService";

const EXAMPLES = ["Ibuprofen", "Metformin", "Aspirin", "Paracetamol", "Imatinib"];

export default function App() {
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drugData, setDrugData] = useState<PubChemCompound | null>(null);
  const [admetProfile, setAdmetProfile] = useState<ADMETProfile | null>(null);

  const handleSearch = async (name: string) => {
    if (!name.trim()) return;
    
    setLoading(true);
    setError(null);
    setDrugData(null);
    setAdmetProfile(null);

    try {
      const pubChemData = await fetchDrugFromPubChem(name);
      setDrugData(pubChemData);
      
      const analysis = await analyzeDrugADMET(pubChemData);
      setAdmetProfile(analysis);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: "safe" | "caution" | "risk") => {
    switch (score) {
      case "safe": return "text-emerald-600 bg-emerald-50 border-emerald-100";
      case "caution": return "text-amber-600 bg-amber-50 border-amber-100";
      case "risk": return "text-rose-600 bg-rose-50 border-rose-100";
    }
  };

  const getToxicityRatingColor = (rating: string) => {
    switch (rating.toLowerCase()) {
      case "low":
      case "negative": 
        return "text-emerald-600 bg-emerald-50 border-emerald-100";
      case "moderate": 
        return "text-amber-600 bg-amber-50 border-amber-100";
      case "high":
      case "positive": 
        return "text-rose-600 bg-rose-50 border-rose-100";
      default: return "text-slate-600 bg-slate-50 border-slate-100";
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 selection:bg-teal-100">
      {/* Header Section */}
      <header className="bg-[#0F172A] text-white pt-12 pb-24 px-4 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -right-24 w-64 h-64 bg-teal-600/10 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
              <FlaskConical className="text-white" size={28} />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">ADME-Bot</h1>
          </motion.div>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            AI-powered pharmaceutical drug safety analysis. Analyze molecular properties and ADMET profiles instantly.
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-400 transition-colors" size={20} />
              <input 
                type="text"
                placeholder="Enter drug name (e.g., Metformin)..."
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all text-lg"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(searchInput)}
              />
              <button 
                onClick={() => handleSearch(searchInput)}
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-teal-500 hover:bg-teal-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-[#0F172A] font-bold px-6 py-2 rounded-xl transition-all shadow-lg active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Analyze"}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-sm">
              <span className="text-slate-500">Quick analysis:</span>
              {EXAMPLES.map(name => (
                <button 
                  key={name}
                  onClick={() => { setSearchInput(name); handleSearch(name); }}
                  className="bg-white/5 hover:bg-white/10 text-slate-300 px-3 py-1 rounded-full border border-white/10 transition-colors text-xs font-medium"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 -mt-12 relative z-20">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-rose-50 border border-rose-200 p-6 rounded-2xl flex items-start gap-4 text-rose-800"
            >
              <AlertTriangle className="shrink-0 text-rose-500" size={24} />
              <div>
                <h3 className="font-bold text-lg mb-1">Analysis Failed</h3>
                <p>{error}</p>
              </div>
            </motion.div>
          )}

          {loading && !admetProfile && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card p-12 text-center flex flex-col items-center gap-6"
            >
              <div className="relative">
                <Loader2 className="animate-spin text-teal-600" size={64} />
                <Dna className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400" size={24} />
              </div>
              <div>
                <p className="text-slate-900 font-bold text-xl mb-2">Analyzing Molecule...</p>
                <p className="text-slate-500 max-w-sm mx-auto">
                  Fetching pharmacological data from PubChem and running clinical safety simulations via Gemini AI.
                </p>
              </div>
            </motion.div>
          )}

          {admetProfile && drugData && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Molecule Identity Card */}
              <div className="glass-card p-6 flex flex-col md:flex-row gap-8 items-center">
                <div className="shrink-0 w-32 h-32 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 overflow-hidden relative">
                  <img 
                    src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${drugData.cid}/PNG`} 
                    alt={drugData.name}
                    className="w-full h-full object-contain p-2 mix-blend-multiply"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold text-slate-900">{drugData.name}</h2>
                    <span className="text-xs font-mono px-2 py-1 bg-teal-50 text-teal-700 border border-teal-100 rounded uppercase tracking-wider">CID: {drugData.cid}</span>
                  </div>
                  <p className="text-slate-500 font-medium mb-4">{drugData.iupacName}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Formula</p>
                      <p className="text-sm font-mono font-bold text-slate-700">{drugData.formula}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Weight</p>
                      <p className="text-sm font-mono font-bold text-slate-700">{drugData.weight} g/mol</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 col-span-2">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">SMILES string</p>
                      <p className="text-[10px] font-mono break-all font-medium text-slate-500">{drugData.smiles}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ADMET Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Absorption */}
                <ADMETItem 
                  label="Absorption" 
                  icon={<Zap size={18} />} 
                  title={admetProfile.absorption.rating}
                  description={admetProfile.absorption.description}
                  colorClass={getScoreColor(admetProfile.absorption.score)}
                  meta={[{ label: "Bioavailability", value: admetProfile.absorption.rating }]}
                />
                
                {/* Distribution */}
                <ADMETItem 
                  label="Distribution" 
                  icon={<Droplets size={18} />} 
                  title="PK Overview"
                  description={admetProfile.distribution.bbb_penetration}
                  colorClass={getScoreColor(admetProfile.distribution.score)}
                  meta={[
                    { label: "BBB Penetration", value: admetProfile.distribution.bbb_penetration.split('.')[0] },
                    { label: "Protein Binding", value: admetProfile.distribution.protein_binding }
                  ]}
                />

                {/* Metabolism */}
                <ADMETItem 
                  label="Metabolism" 
                  icon={<Activity size={18} />} 
                  title="Enzyme Profile"
                  description={admetProfile.metabolism.cyp3a4_interaction}
                  colorClass={getScoreColor(admetProfile.metabolism.score)}
                  meta={[
                    { label: "CYP3A4", value: admetProfile.metabolism.cyp3a4_interaction },
                    { label: "Substrate", value: admetProfile.metabolism.other_pathways }
                  ]}
                />

                {/* Excretion */}
                <ADMETItem 
                  label="Excretion" 
                  icon={<Info size={18} />} 
                  title="Elimination"
                  description={admetProfile.excretion.clearance}
                  colorClass={getScoreColor(admetProfile.excretion.score)}
                  meta={[
                    { label: "Half-life", value: admetProfile.excretion.half_life },
                    { label: "Clearance", value: admetProfile.excretion.clearance }
                  ]}
                />
              </div>

              {/* Toxicity & Safety Section */}
              <div className="glass-card overflow-hidden">
                <div className="bg-slate-900 p-4 flex items-center justify-between">
                  <h3 className="text-white font-bold flex items-center gap-2 uppercase tracking-widest text-xs">
                    <ShieldAlert size={16} className="text-teal-400" />
                    Safety & Toxicity Ratings
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  <ToxItem 
                    label="hERG Cardiotoxicity" 
                    rating={admetProfile.toxicity.herg.rating}
                    description={admetProfile.toxicity.herg.description}
                    colorClass={getToxicityRatingColor(admetProfile.toxicity.herg.rating)}
                  />
                  <ToxItem 
                    label="AMES Mutagenicity" 
                    rating={admetProfile.toxicity.ames.rating}
                    description={admetProfile.toxicity.ames.description}
                    colorClass={getToxicityRatingColor(admetProfile.toxicity.ames.rating)}
                  />
                  <ToxItem 
                    label="DILI Liver Injury" 
                    rating={admetProfile.toxicity.dili.rating}
                    description={admetProfile.toxicity.dili.description}
                    colorClass={getToxicityRatingColor(admetProfile.toxicity.dili.rating)}
                  />
                </div>
              </div>

              {/* Verdict & Summary Section */}
              <div className={`glass-card p-8 border-l-8 ${
                admetProfile.verdict === 'safe' ? 'border-l-emerald-500' : 
                admetProfile.verdict === 'caution' ? 'border-l-amber-500' : 'border-l-rose-500'
              }`}>
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className={`shrink-0 flex items-center gap-2 font-bold px-4 py-2 rounded-lg border uppercase tracking-wider text-sm ${getScoreColor(admetProfile.verdict)}`}>
                    {admetProfile.verdict === 'safe' && <CheckCircle2 size={18} />}
                    {admetProfile.verdict === 'caution' && <AlertTriangle size={18} />}
                    {admetProfile.verdict === 'risk' && <ShieldAlert size={18} />}
                    Overall: {admetProfile.verdict}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Clinical Summary</h3>
                    <p className="text-slate-600 leading-relaxed text-lg italic">
                      "{admetProfile.clinical_summary}"
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {!admetProfile && !loading && !error && (
            <div className="glass-card p-20 text-center flex flex-col items-center gap-4 text-slate-400">
              <Database size={48} className="opacity-20" />
              <p className="text-lg">Enter a drug name above to begin analysis.</p>
            </div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-20 text-center py-10 px-4">
        <p className="text-slate-400 text-sm flex items-center justify-center gap-2">
           Built for pharmaceutical clinical research • Powered by Gemini AI & PubChem
        </p>
      </footer>
    </div>
  );
}

function ADMETItem({ label, icon, title, description, colorClass, meta }: {
  label: string,
  icon: ReactNode,
  title: string,
  description: string,
  colorClass: string,
  meta: { label: string, value: string }[]
}) {
  return (
    <div className="glass-card p-6 flex flex-col h-full hover:shadow-lg transition-all border-b-4 border-b-transparent hover:border-b-teal-500/20 group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
          <span className="text-teal-600 group-hover:scale-110 transition-transform">{icon}</span>
          {label}
        </div>
        <div className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-tight ${colorClass}`}>
          {title}
        </div>
      </div>
      
      <p className="text-slate-700 font-medium mb-6 line-clamp-3 text-sm">
        {description}
      </p>

      <div className="mt-auto pt-4 border-t border-slate-50 space-y-2">
        {meta.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">{item.label}</span>
            <span className="text-slate-700 font-bold text-right">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ToxItem({ label, rating, description, colorClass }: {
  label: string,
  rating: string,
  description: string,
  colorClass: string
}) {
  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${colorClass}`}>
          {rating}
        </span>
      </div>
      <p className="text-slate-600 text-sm font-medium leading-relaxed">
        {description}
      </p>
    </div>
  );
}
