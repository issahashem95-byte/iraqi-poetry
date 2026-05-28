import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════
//  PERSISTENT STORAGE
// ═══════════════════════════════════════════
const STORAGE_KEY = "iraqi-poetry-cards";

const loadCards = async () => {
  try {
    const result = await window.storage.get(STORAGE_KEY);
    return result ? JSON.parse(result.value) : [];
  } catch {
    return [];
  }
};

const saveCards = async (cards) => {
  try {
    await window.storage.set(STORAGE_KEY, JSON.stringify(cards));
  } catch (e) {
    console.error("Save failed:", e);
  }
};

// ═══════════════════════════════════════════
//  SAMPLE DATA
// ═══════════════════════════════════════════
const SAMPLE_CARDS = [
  {
    id: "sample-1",
    type: "قصيدة",
    title: "يا بغداد",
    text: "يا بغداد يا أم الدنيا\nويا عيون الفرات الحلوة\nبس انتي تبقين حلم الروح\nوأغلى شي بالدنيا كلها",
    bg: "linear-gradient(135deg, #1a0a00 0%, #3d1a00 50%, #1a0a00 100%)",
    accent: "#d4a017",
    textColor: "#fff8e7",
    image: null,
    createdAt: Date.now() - 86400000,
    likes: 24,
  },
  {
    id: "sample-2",
    type: "عبارة",
    title: "حكمة عراقية",
    text: "الوفة مو بالكلام.. الوفة بالمواقف",
    bg: "linear-gradient(135deg, #0a0a1a 0%, #1a1a3d 50%, #0a0a1a 100%)",
    accent: "#7b68ee",
    textColor: "#e8e4ff",
    image: null,
    createdAt: Date.now() - 3600000,
    likes: 41,
  },
  {
    id: "sample-3",
    type: "قصيدة",
    title: "شوك الغربة",
    text: "الغربة علّمتني شلون أصبر\nوعلّمتني شلون أبتسم وأنا أتألم\nبس ما علّمتني أنسى ريحة التراب\nريحة بلادي الغالية",
    bg: "linear-gradient(135deg, #001a0a 0%, #003d1a 50%, #001a0a 100%)",
    accent: "#2ecc71",
    textColor: "#e8fff4",
    image: null,
    createdAt: Date.now(),
    likes: 18,
  },
];

// ═══════════════════════════════════════════
//  THEME OPTIONS
// ═══════════════════════════════════════════
const THEMES = [
  { label: "ذهبي", bg: "linear-gradient(135deg, #1a0a00 0%, #3d1a00 50%, #1a0a00 100%)", accent: "#d4a017", textColor: "#fff8e7" },
  { label: "ليلي", bg: "linear-gradient(135deg, #0a0a1a 0%, #1a1a3d 50%, #0a0a1a 100%)", accent: "#7b68ee", textColor: "#e8e4ff" },
  { label: "زمردي", bg: "linear-gradient(135deg, #001a0a 0%, #003d1a 50%, #001a0a 100%)", accent: "#2ecc71", textColor: "#e8fff4" },
  { label: "وردي", bg: "linear-gradient(135deg, #1a000a 0%, #3d001a 50%, #1a000a 100%)", accent: "#e91e8c", textColor: "#ffe8f0" },
  { label: "سماوي", bg: "linear-gradient(135deg, #001a1a 0%, #003d3d 50%, #001a1a 100%)", accent: "#00bcd4", textColor: "#e8feff" },
  { label: "نحاسي", bg: "linear-gradient(135deg, #1a0f00 0%, #3d2000 50%, #1a0f00 100%)", accent: "#e07b39", textColor: "#fff3e8" },
];

// ═══════════════════════════════════════════
//  CARD COMPONENT
// ═══════════════════════════════════════════
function PoetryCard({ card, onLike, isAdmin, onDelete, onEdit }) {
  const [liked, setLiked] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      onLike(card.id);
    }
  };

  const handleShare = async () => {
    const text = `${card.title}\n\n${card.text}\n\n— شعر عراقي 🌹`;
    if (navigator.share) {
      await navigator.share({ text });
    } else {
      await navigator.clipboard.writeText(text);
      alert("تم نسخ النص!");
    }
  };

  return (
    <div style={{
      background: card.bg,
      borderRadius: 20,
      overflow: "hidden",
      position: "relative",
      boxShadow: `0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px ${card.accent}33`,
      marginBottom: 24,
      transition: "transform 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
    >
      {/* Decorative top border */}
      <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${card.accent}, transparent)` }} />

      {/* Image */}
      {card.image && (
        <div style={{ position: "relative", overflow: "hidden", maxHeight: 220 }}>
          <img src={card.image} alt="" style={{ width: "100%", objectFit: "cover", display: "block", opacity: 0.85 }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, transparent 40%, ${card.bg.includes("#1a0a00") ? "#1a0a00" : "#0a0a1a"} 100%)` }} />
        </div>
      )}

      <div style={{ padding: "24px 24px 18px", direction: "rtl" }}>
        {/* Type badge */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{
            background: `${card.accent}25`, border: `1px solid ${card.accent}55`,
            color: card.accent, padding: "3px 14px", borderRadius: 20,
            fontSize: 12, fontWeight: "bold", letterSpacing: 1
          }}>{card.type}</span>
          {isAdmin && (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => onEdit(card)} style={{
                background: "rgba(255,255,255,0.08)", border: "none", color: "#aaa",
                borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 13
              }}>✏️</button>
              <button onClick={() => onDelete(card.id)} style={{
                background: "rgba(255,0,0,0.1)", border: "none", color: "#ff6b6b",
                borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 13
              }}>🗑️</button>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 style={{
          color: card.accent, fontSize: 22, margin: "0 0 14px", fontWeight: "bold",
          fontFamily: "'Georgia', serif", textShadow: `0 0 20px ${card.accent}66`
        }}>{card.title}</h3>

        {/* Text */}
        <p style={{
          color: card.textColor, fontSize: 17, lineHeight: 2.2, margin: "0 0 20px",
          fontFamily: "'Georgia', 'Scheherazade New', serif",
          whiteSpace: "pre-line", textAlign: "justify"
        }}>{card.text}</p>

        {/* Footer */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderTop: `1px solid ${card.accent}22`, paddingTop: 14
        }}>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
            {new Date(card.createdAt).toLocaleDateString("ar-IQ")}
          </span>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button onClick={handleShare} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(255,255,255,0.5)", fontSize: 18, padding: 0
            }} title="مشاركة">📤</button>
            <button onClick={handleLike} style={{
              background: "none", border: "none", cursor: "pointer",
              color: liked ? "#e91e8c" : "rgba(255,255,255,0.4)",
              fontSize: 18, padding: 0, transition: "all 0.2s",
              transform: liked ? "scale(1.3)" : "scale(1)"
            }}>❤️</button>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{card.likes + (liked ? 1 : 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
//  ADMIN PANEL
// ═══════════════════════════════════════════
function AdminPanel({ cards, setCards, onSave }) {
  const [form, setForm] = useState({
    id: null, type: "قصيدة", title: "", text: "", image: null,
    bg: THEMES[0].bg, accent: THEMES[0].accent, textColor: THEMES[0].textColor,
  });
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const imgRef = useRef();

  const handleTheme = (t) => setForm(f => ({ ...f, bg: t.bg, accent: t.accent, textColor: t.textColor }));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, image: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.text.trim()) return alert("اكتب العنوان والنص!");
    setSaving(true);
    const newCard = {
      ...form,
      id: form.id || `card-${Date.now()}`,
      createdAt: form.id ? (cards.find(c => c.id === form.id)?.createdAt || Date.now()) : Date.now(),
      likes: form.id ? (cards.find(c => c.id === form.id)?.likes || 0) : 0,
    };
    let updated;
    if (form.id) {
      updated = cards.map(c => c.id === form.id ? newCard : c);
    } else {
      updated = [newCard, ...cards];
    }
    await onSave(updated);
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
    setForm({ id: null, type: "قصيدة", title: "", text: "", image: null, bg: THEMES[0].bg, accent: THEMES[0].accent, textColor: THEMES[0].textColor });
  };

  const handleEdit = (card) => {
    setForm({ ...card });
    setPreview(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("تريد تحذف هذه البطاقة؟")) return;
    const updated = cards.filter(c => c.id !== id);
    await onSave(updated);
  };

  const previewCard = { ...form, id: "preview", createdAt: Date.now(), likes: 0 };

  return (
    <div style={{ direction: "rtl" }}>
      {/* Form */}
      <div style={{
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20, padding: 24, marginBottom: 32
      }}>
        <h2 style={{ color: "#d4a017", margin: "0 0 20px", fontSize: 20 }}>
          {form.id ? "✏️ تعديل البطاقة" : "➕ بطاقة جديدة"}
        </h2>

        {/* Type */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, display: "block", marginBottom: 8 }}>النوع</label>
          <div style={{ display: "flex", gap: 10 }}>
            {["قصيدة", "عبارة", "حكمة", "خاطرة"].map(t => (
              <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))} style={{
                padding: "8px 18px", borderRadius: 20, border: "none", cursor: "pointer",
                background: form.type === t ? "#d4a017" : "rgba(255,255,255,0.07)",
                color: form.type === t ? "#000" : "rgba(255,255,255,0.6)",
                fontFamily: "inherit", fontWeight: form.type === t ? "bold" : "normal",
                fontSize: 14, transition: "all 0.2s"
              }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, display: "block", marginBottom: 8 }}>العنوان</label>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="عنوان القصيدة أو العبارة..."
            style={{
              width: "100%", padding: "12px 16px", borderRadius: 12,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff", fontSize: 16, fontFamily: "'Georgia', serif",
              outline: "none", boxSizing: "border-box", direction: "rtl"
            }} />
        </div>

        {/* Text */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, display: "block", marginBottom: 8 }}>النص / القصيدة</label>
          <textarea value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
            placeholder="اكتب هنا القصيدة أو العبارة باللهجة العراقية..."
            rows={6}
            style={{
              width: "100%", padding: "12px 16px", borderRadius: 12,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff", fontSize: 16, fontFamily: "'Georgia', serif",
              outline: "none", resize: "vertical", boxSizing: "border-box",
              direction: "rtl", lineHeight: 2
            }} />
        </div>

        {/* Image upload */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, display: "block", marginBottom: 8 }}>صورة (اختياري)</label>
          <input ref={imgRef} type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={() => imgRef.current.click()} style={{
              padding: "10px 20px", borderRadius: 12, border: "1px dashed rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)",
              cursor: "pointer", fontFamily: "inherit", fontSize: 14
            }}>📷 رفع صورة</button>
            {form.image && (
              <>
                <img src={form.image} alt="" style={{ height: 50, borderRadius: 8, objectFit: "cover" }} />
                <button onClick={() => setForm(f => ({ ...f, image: null }))} style={{
                  background: "rgba(255,0,0,0.15)", border: "none", color: "#ff6b6b",
                  borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13
                }}>حذف</button>
              </>
            )}
          </div>
        </div>

        {/* Theme */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, display: "block", marginBottom: 10 }}>لون البطاقة</label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {THEMES.map(t => (
              <button key={t.label} onClick={() => handleTheme(t)} style={{
                width: 44, height: 44, borderRadius: "50%", border: form.accent === t.accent ? `3px solid ${t.accent}` : "2px solid transparent",
                background: t.bg, cursor: "pointer", position: "relative",
                boxShadow: form.accent === t.accent ? `0 0 15px ${t.accent}88` : "none",
                transition: "all 0.2s"
              }} title={t.label}>
                {form.accent === t.accent && <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleSubmit} disabled={saving} style={{
            flex: 1, padding: "14px", borderRadius: 14, border: "none", cursor: "pointer",
            background: success ? "#2ecc71" : "linear-gradient(135deg, #d4a017, #f0c040)",
            color: "#000", fontWeight: "bold", fontSize: 16, fontFamily: "inherit",
            transition: "all 0.3s", boxShadow: "0 4px 20px rgba(212,160,23,0.4)"
          }}>
            {saving ? "جاري الحفظ..." : success ? "✅ تم الحفظ!" : form.id ? "💾 حفظ التعديل" : "🚀 نشر البطاقة"}
          </button>
          <button onClick={() => setPreview(p => !p)} style={{
            padding: "14px 20px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)",
            cursor: "pointer", fontFamily: "inherit", fontSize: 15
          }}>{preview ? "إخفاء" : "👁️ معاينة"}</button>
          {form.id && (
            <button onClick={() => setForm({ id: null, type: "قصيدة", title: "", text: "", image: null, bg: THEMES[0].bg, accent: THEMES[0].accent, textColor: THEMES[0].textColor })} style={{
              padding: "14px 16px", borderRadius: 14, border: "1px solid rgba(255,0,0,0.2)",
              background: "rgba(255,0,0,0.06)", color: "#ff6b6b",
              cursor: "pointer", fontFamily: "inherit", fontSize: 14
            }}>إلغاء</button>
          )}
        </div>

        {/* Preview */}
        {preview && (
          <div style={{ marginTop: 24 }}>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginBottom: 12 }}>معاينة البطاقة:</div>
            <PoetryCard card={previewCard} onLike={() => {}} isAdmin={false} onDelete={() => {}} onEdit={() => {}} />
          </div>
        )}
      </div>

      {/* Cards list */}
      <h3 style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, marginBottom: 16 }}>
        📋 البطاقات المنشورة ({cards.length})
      </h3>
      {cards.length === 0 ? (
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", padding: 40 }}>لا توجد بطاقات بعد</div>
      ) : (
        cards.map(card => (
          <PoetryCard key={card.id} card={card} onLike={() => {}} isAdmin={true}
            onDelete={handleDelete} onEdit={handleEdit} />
        ))
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
//  USER VIEW
// ═══════════════════════════════════════════
function UserView({ cards, onLike }) {
  const [filter, setFilter] = useState("الكل");
  const types = ["الكل", "قصيدة", "عبارة", "حكمة", "خاطرة"];
  const filtered = filter === "الكل" ? cards : cards.filter(c => c.type === filter);

  return (
    <div style={{ direction: "rtl" }}>
      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{
            padding: "8px 18px", borderRadius: 20, border: "none", cursor: "pointer",
            background: filter === t ? "#d4a017" : "rgba(255,255,255,0.06)",
            color: filter === t ? "#000" : "rgba(255,255,255,0.55)",
            fontFamily: "inherit", fontWeight: filter === t ? "bold" : "normal",
            fontSize: 14, transition: "all 0.2s",
            boxShadow: filter === t ? "0 4px 15px rgba(212,160,23,0.4)" : "none"
          }}>{t}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 20px",
          color: "rgba(255,255,255,0.3)", fontSize: 16
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📜</div>
          لا توجد بطاقات في هذا القسم
        </div>
      ) : (
        filtered.map(card => (
          <PoetryCard key={card.id} card={card} onLike={onLike}
            isAdmin={false} onDelete={() => {}} onEdit={() => {}} />
        ))
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════
export default function App() {
  const [view, setView] = useState("user"); // "user" | "admin"
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminPass, setAdminPass] = useState("");
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [passErr, setPassErr] = useState(false);
  const ADMIN_PASS = "admin123";

  useEffect(() => {
    (async () => {
      const saved = await loadCards();
      setCards(saved.length ? saved : SAMPLE_CARDS);
      setLoading(false);
    })();
  }, []);

  const handleSave = async (updated) => {
    setCards(updated);
    await saveCards(updated);
  };

  const handleLike = async (id) => {
    const updated = cards.map(c => c.id === id ? { ...c, likes: c.likes + 1 } : c);
    await handleSave(updated);
  };

  const handleAdminLogin = () => {
    if (adminPass === ADMIN_PASS) {
      setAdminAuthed(true);
      setView("admin");
      setPassErr(false);
    } else {
      setPassErr(true);
      setTimeout(() => setPassErr(false), 2000);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at top, #120800 0%, #05030a 100%)",
      color: "#fff",
      fontFamily: "'Georgia', 'Times New Roman', serif",
    }}>
      <style>{`
        * { box-sizing: border-box; }
        input:focus, textarea:focus { border-color: rgba(212,160,23,0.5) !important; }
        button { transition: all 0.2s; }
        button:hover { opacity: 0.88; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeIn 0.5s ease forwards; }
      `}</style>

      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(5,3,10,0.92)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(212,160,23,0.15)",
        padding: "14px 20px",
      }}>
        <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ direction: "rtl" }}>
            <div style={{ fontSize: 20, fontWeight: "bold", color: "#d4a017", letterSpacing: 1 }}>
              🌹 شعر عراقي
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>عبارات وقصائد من القلب</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setView("user")} style={{
              padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer",
              background: view === "user" ? "#d4a017" : "rgba(255,255,255,0.07)",
              color: view === "user" ? "#000" : "rgba(255,255,255,0.5)",
              fontFamily: "inherit", fontWeight: view === "user" ? "bold" : "normal", fontSize: 13
            }}>📜 تصفح</button>
            <button onClick={() => { if (adminAuthed) setView("admin"); else setView("admin-login"); }} style={{
              padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer",
              background: view === "admin" ? "#d4a017" : "rgba(255,255,255,0.07)",
              color: view === "admin" ? "#000" : "rgba(255,255,255,0.5)",
              fontFamily: "inherit", fontWeight: view === "admin" ? "bold" : "normal", fontSize: 13
            }}>🔐 أدمن</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "28px 16px 60px" }}>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,0.3)" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📜</div>
            جاري التحميل...
          </div>
        ) : view === "admin-login" ? (
          <div className="fade-in" style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,160,23,0.2)",
            borderRadius: 20, padding: 40, textAlign: "center", direction: "rtl"
          }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>🔐</div>
            <h2 style={{ color: "#d4a017", marginBottom: 8 }}>دخول الأدمن</h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 28 }}>
              أدخل كلمة المرور للوصول للوحة التحكم
            </p>
            <input
              type="password"
              value={adminPass}
              onChange={e => setAdminPass(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdminLogin()}
              placeholder="كلمة المرور..."
              style={{
                width: "100%", padding: "14px 18px", borderRadius: 12,
                background: "rgba(255,255,255,0.07)",
                border: `1px solid ${passErr ? "#ff6b6b" : "rgba(255,255,255,0.12)"}`,
                color: "#fff", fontSize: 16, fontFamily: "inherit",
                outline: "none", textAlign: "center", marginBottom: 16, direction: "ltr"
              }} />
            {passErr && <p style={{ color: "#ff6b6b", fontSize: 14, marginBottom: 16 }}>❌ كلمة المرور غير صحيحة</p>}
            <button onClick={handleAdminLogin} style={{
              width: "100%", padding: "14px", borderRadius: 14, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #d4a017, #f0c040)",
              color: "#000", fontWeight: "bold", fontSize: 16, fontFamily: "inherit"
            }}>دخول</button>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, marginTop: 20 }}>
              كلمة المرور الافتراضية: admin123
            </p>
          </div>
        ) : view === "admin" ? (
          <div className="fade-in">
            <AdminPanel cards={cards} setCards={setCards} onSave={handleSave} />
          </div>
        ) : (
          <div className="fade-in">
            <UserView cards={cards} onLike={handleLike} />
          </div>
        )}
      </div>
    </div>
  );
}
