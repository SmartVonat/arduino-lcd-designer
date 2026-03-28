import React, { useState, useEffect, useRef } from 'react';
import { Plus, Download, Trash2, Palette, Upload } from 'lucide-react';

const EMPTY_PIXELS = () => Array(8).fill(null).map(() => Array(5).fill(0));
const EMPTY_GRID = () => Array(2).fill(null).map(() => Array(16).fill(' '));

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
};

const THEMES = {
  green: {
    text: 'text-[#1c260d]',
    cellBg: 'bg-[#8cd92b]',
    cellFocus: 'focus:bg-[#9ee13f] focus:ring-[#1c260d]',
    pcb: 'bg-[#5a8d1a]',
    gridContainer: 'bg-[#82ce1e]',
    pixelOn: 'bg-[#1c260d]',
    pixelOff: 'bg-black/5',
    editorPixelOff: 'bg-[#96d136]',
    editorPixelOffHover: 'hover:bg-[#88c22d]'
  },
  blue: {
    text: 'text-[#ffffff]',
    cellBg: 'bg-[#0055ff]',
    cellFocus: 'focus:bg-[#3377ff] focus:ring-white',
    pcb: 'bg-[#002288]',
    gridContainer: 'bg-[#0044dd]',
    pixelOn: 'bg-[#ffffff]',
    pixelOff: 'bg-white/10',
    editorPixelOff: 'bg-[#3377ff]',
    editorPixelOffHover: 'hover:bg-[#5599ff]'
  }
};

// --- Sub-components ---

const CustomChar = ({ pixels, theme = 'blue', className = "" }) => {
  const colors = THEMES[theme];
  return (
    <div className={`flex flex-col gap-[1px] ${className}`}>
      {pixels.map((row, r) => (
        <div key={r} className="flex flex-1 gap-[1px]">
          {row.map((on, c) => (
            <div key={c} className={`flex-1 transition-colors ${on ? colors.pixelOn : colors.pixelOff}`} />
          ))}
        </div>
      ))}
    </div>
  );
};

const Cell = ({ cardId, row, col, value, onUpdate, onFocusNext, customChars, theme = 'blue' }) => {
  const colors = THEMES[theme];
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); onFocusNext(row, col + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); onFocusNext(row, col - 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); onFocusNext(row - 1, col); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); onFocusNext(row + 1, col); }
    else if (e.key === 'Backspace') {
      e.preventDefault();
      const isEmpty = value === ' ' || value === '' || value === null;
      if (!isEmpty) {
        onUpdate(cardId, row, col, ' ');
      } else {
        // Move back and delete
        let nextR = row;
        let nextC = col - 1;
        if (nextC < 0) { nextC = 15; nextR--; }
        if (nextR >= 0) {
          onUpdate(cardId, nextR, nextC, ' ');
          onFocusNext(nextR, nextC);
        }
      }
    }
    else if (e.key === 'Delete') {
      e.preventDefault();
      onUpdate(cardId, row, col, ' ');
    }
    else if (e.key.length === 1) { 
      // Printable character
      e.preventDefault();
      onUpdate(cardId, row, col, e.key.toUpperCase());
      onFocusNext(row, col + 1);
    }
  };

  const getCustomCharPixels = (id) => {
    const char = customChars.find(c => c.id === id);
    return char ? char.pixels : EMPTY_PIXELS();
  };

  return (
    <div
      id={`cell-${cardId}-${row}-${col}`}
      tabIndex={0}
      className={`w-[28px] h-[40px] flex items-center justify-center outline-none focus:ring-2 focus:ring-inset cursor-text transition-colors duration-75 relative ${colors.cellBg} ${colors.cellFocus}`}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.currentTarget.focus()}
      onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.filter = 'brightness(1.1)'; }}
      onDragLeave={(e) => { e.currentTarget.style.filter = ''; }}
      onDrop={(e) => {
        e.preventDefault();
        e.currentTarget.style.filter = '';
        const customId = e.dataTransfer.getData('customCharId');
        if (customId) onUpdate(cardId, row, col, { custom: customId });
      }}
    >
      {typeof value === 'object' && value?.custom ? (
        <CustomChar pixels={getCustomCharPixels(value.custom)} theme={theme} className="w-[20px] h-[32px] pointer-events-none" />
      ) : (
        <span className={`font-mono font-bold text-[24px] leading-none select-none pointer-events-none ${colors.text}`}>
          {value === ' ' ? '' : value}
        </span>
      )}
    </div>
  );
};

// --- Main Application ---

export default function App() {
  const [cards, setCards] = useState([]);
  const [customChars, setCustomChars] = useState([]);
  const [activeCharId, setActiveCharId] = useState(null);
  const [theme, setTheme] = useState('blue');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const savedCards = localStorage.getItem('lcd-cards');
      const savedChars = localStorage.getItem('lcd-chars');
      const savedTheme = localStorage.getItem('lcd-theme');
      
      if (savedCards) setCards(JSON.parse(savedCards));
      else setCards([{ id: generateId(), title: 'Screen 1', grid: EMPTY_GRID() }]);
      
      if (savedChars) setCustomChars(JSON.parse(savedChars));
      if (savedTheme) setTheme(savedTheme);
    } catch (e) {
      console.error('Failed to load from cache', e);
      setCards([{ id: generateId(), title: 'Screen 1', grid: EMPTY_GRID() }]);
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage on changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('lcd-cards', JSON.stringify(cards));
        localStorage.setItem('lcd-chars', JSON.stringify(customChars));
        localStorage.setItem('lcd-theme', theme);
      } catch (e) {
        console.error('Failed to save to cache', e);
      }
    }
  }, [cards, customChars, theme, isLoaded]);

  // --- Handlers ---

  const addCard = () => {
    setCards([...cards, {
      id: generateId(),
      title: `Screen ${cards.length + 1}`,
      grid: EMPTY_GRID()
    }]);
  };

  const deleteCard = (id) => {
    setCards(prev => prev.filter(c => c.id !== id));
  };

  const updateCardTitle = (id, newTitle) => {
    setCards(prev => prev.map(card => card.id === id ? { ...card, title: newTitle } : card));
  };

  const updateCell = (cardId, row, col, val) => {
    setCards(prev => prev.map(card => {
      if (card.id !== cardId) return card;
      const newGrid = card.grid.map((r, rIdx) => 
        rIdx === row ? r.map((c, cIdx) => cIdx === col ? val : c) : r
      );
      return { ...card, grid: newGrid };
    }));
  };

  const focusCell = (cardId, r, c) => {
    let nextR = r;
    let nextC = c;
    if (nextC > 15) { nextC = 0; nextR++; }
    if (nextC < 0) { nextC = 15; nextR--; }
    if (nextR < 0 || nextR > 1) return; // Stop at bounds

    const el = document.getElementById(`cell-${cardId}-${nextR}-${nextC}`);
    if (el) el.focus();
  };

  const addCustomChar = () => {
    const newChar = { id: generateId(), pixels: EMPTY_PIXELS() };
    setCustomChars(prev => [...prev, newChar]);
    setActiveCharId(newChar.id);
  };

  const deleteCustomChar = (id) => {
    setCustomChars(prev => prev.filter(c => c.id !== id));
    if (activeCharId === id) setActiveCharId(null);
    
    // Cleanup any screen usages of this deleted custom character
    setCards(prev => prev.map(card => ({
      ...card,
      grid: card.grid.map(row => row.map(cell => 
        (typeof cell === 'object' && cell?.custom === id) ? ' ' : cell
      ))
    })));
  };

  const togglePixel = (r, c) => {
    setCustomChars(prev => prev.map(char => {
      if (char.id !== activeCharId) return char;
      const newPixels = char.pixels.map((row, rowIndex) =>
        rowIndex === r ? row.map((val, colIndex) => colIndex === c ? (val ? 0 : 1) : val) : row
      );
      return { ...char, pixels: newPixels };
    }));
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.cards && data.customChars) {
          setCards(data.cards);
          setCustomChars(data.customChars);
        } else {
          alert("Invalid layout file format.");
        }
      } catch (err) {
        console.error("Failed to parse JSON", err);
        alert("Failed to read the file. Please ensure it is a valid JSON design export.");
      }
    };
    reader.readAsText(file);
    e.target.value = null; // reset input to allow importing the same file again
  };

  const exportData = () => {
    const data = { cards, customChars };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arduino_lcd_designs.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isLoaded) return null;

  const colors = THEMES[theme];

  return (
    <div className="flex h-screen w-screen bg-gray-100 font-sans overflow-hidden text-gray-800">
      
      {/* Left Panel: Display Cards */}
      <div className="flex-1 flex flex-col h-full relative border-r border-gray-200 shadow-[2px_0_8px_rgba(0,0,0,0.05)] z-10">
        <header className="absolute top-0 w-full h-16 bg-white/90 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 z-20">
          <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">Arduino LCD Designer</h1>
          
          <div className="flex items-center gap-6">
            {/* Theme Toggle */}
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button 
                onClick={() => setTheme('green')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${theme === 'green' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Green
              </button>
              <button 
                onClick={() => setTheme('blue')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${theme === 'blue' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Blue
              </button>
            </div>

            {/* Import/Export */}
            <div className="flex items-center gap-2">
              <input type="file" accept=".json" id="import-file" className="hidden" onChange={handleImport} />
              <label 
                htmlFor="import-file" 
                className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm active:scale-95 cursor-pointer border border-gray-200"
              >
                <Upload className="w-4 h-4" /> Import Designs
              </label>

              <button 
                onClick={exportData}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm active:scale-95"
              >
                <Download className="w-4 h-4" /> Export Designs
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 mt-16 p-6 overflow-y-auto flex flex-col items-center gap-8 pb-12">
          {cards.map(card => (
            <div key={card.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 w-full max-w-3xl flex flex-col transition-all">
              <div className="flex justify-between items-center mb-5">
                <input 
                  value={card.title}
                  onChange={(e) => updateCardTitle(card.id, e.target.value)}
                  className="bg-transparent text-xl font-bold text-gray-800 outline-none focus:border-b-2 border-blue-500 placeholder-gray-400 w-full px-1 py-1"
                  placeholder="Enter Screen Title..."
                />
                <button 
                  onClick={() => deleteCard(card.id)} 
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-md transition-colors"
                  title="Delete Card"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Hardware LCD Bezel */}
              <div className="bg-[#1a1a1a] rounded-xl p-5 flex items-center justify-center shadow-xl mx-auto w-fit">
                {/* PCB Trace Outline */}
                <div className={`p-1.5 rounded shadow-[inset_0_2px_10px_rgba(0,0,0,0.7)] transition-colors ${colors.pcb}`}>
                  {/* Actual Screen Grid */}
                  <div className={`p-2 flex flex-col gap-[2px] shadow-[inset_0_0_15px_rgba(0,0,0,0.2)] transition-colors ${colors.gridContainer}`}>
                    {card.grid.map((row, r) => (
                      <div key={r} className="flex gap-[2px]">
                        {row.map((val, c) => (
                          <Cell
                            key={`${r}-${c}`}
                            cardId={card.id}
                            row={r}
                            col={c}
                            value={val}
                            onUpdate={updateCell}
                            onFocusNext={(nr, nc) => focusCell(card.id, nr, nc)}
                            customChars={customChars}
                            theme={theme}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-[13px] text-gray-400 mt-5 text-center font-medium">Click any character cell to start typing. Use Arrow Keys to freely navigate.</p>
            </div>
          ))}

          {/* Add Screen Button */}
          <button 
            onClick={addCard}
            className="w-full max-w-3xl py-6 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-3"
          >
            <Plus className="w-8 h-8" />
            <span className="font-semibold text-lg">Add New Screen</span>
      </button>
    </main>
  </div>

  {/* Right Panel: Character Swatch & Editor (widened from w-80 to w-96) */}
  <div className="w-96 bg-white flex flex-col h-full z-0">
    
    {/* Header */}
    <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between shadow-sm z-10">
          <h2 className="font-bold text-gray-800">Custom Characters</h2>
          <button 
            onClick={addCustomChar} 
            className="p-1.5 hover:bg-blue-100 bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-600 rounded-md transition-all shadow-sm"
            title="Create Custom Character"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Swatch List */}
        <div className="p-5 border-b border-gray-200 max-h-[45%] overflow-y-auto bg-gray-50/50">
          {customChars.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-6 flex flex-col items-center gap-2">
              <Palette className="w-8 h-8 text-gray-300" />
              <p>No characters yet.<br/>Click the + button to create one!</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {customChars.map(char => (
            <div
              key={char.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('customCharId', char.id)}
              onClick={() => setActiveCharId(char.id)}
              className={`w-14 h-[72px] p-1.5 rounded shadow-sm cursor-pointer transition-all ${colors.gridContainer} ${
                activeCharId === char.id ? 'ring-4 ring-blue-500/50 scale-105 z-10' : 'ring-1 ring-black/20 hover:scale-105 hover:shadow-md'
              }`}
              title="Drag to a screen cell or click to edit"
            >
              <CustomChar pixels={char.pixels} theme={theme} className="w-full h-full pointer-events-none" />
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Pixel Editor */}
    <div className="flex-1 p-6 bg-white flex flex-col items-center overflow-y-auto">
      {activeCharId ? (
        <div className="w-full flex flex-col items-center animate-in fade-in duration-200">
          <h3 className="text-sm font-bold text-gray-700 mb-2 w-full text-center uppercase tracking-wider">Pixel Editor</h3>
          <p className="text-[11px] text-gray-500 mb-6 text-center leading-relaxed">
            Click pixels to toggle them on or off. Drag the character from the swatch above onto any display cell.
          </p>
          
          <div className={`p-3 rounded-lg shadow-inner border-[4px] transition-colors ${colors.gridContainer} ${theme === 'green' ? 'border-[#5a8d1a]' : 'border-[#002288]'}`}>
            <div className="grid grid-rows-8 grid-cols-5 gap-[2px] w-[140px] h-[224px]">
              {customChars.find(c => c.id === activeCharId)?.pixels.map((row, r) =>
                row.map((on, c) => (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => togglePixel(r, c)}
                    className={`cursor-pointer transition-colors ${on ? colors.pixelOn : `${colors.editorPixelOff} ${colors.editorPixelOffHover}`}`}
                  />
                ))
              )}
            </div>
          </div>

          <button 
            onClick={() => deleteCustomChar(activeCharId)}
                className="mt-8 flex items-center justify-center gap-2 px-4 py-2 w-full max-w-[200px] border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-md text-sm font-bold transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete Character
              </button>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center flex-col text-gray-400">
              <Palette className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-sm text-center px-4 font-medium">Select a character from the swatch or create a new one to begin editing.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}