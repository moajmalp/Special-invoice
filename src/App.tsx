import { useState, useEffect } from 'react'
import { Plus, Trash2, Printer, Settings2, FileText, CheckCircle2, RotateCcw, Sun, Moon, AlertTriangle } from 'lucide-react'

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  rate: number
}

function App() {
  // --- Theme State (persisted in localStorage) ---
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('inv_dark_mode')
    return saved !== null ? JSON.parse(saved) : true
  })

  // --- Company Settings (Bilingual - persisted in localStorage) ---
  const [companyNameEn, setCompanyNameEn] = useState(() => {
    return localStorage.getItem('inv_comp_name_en') || 'SPECIAL TYPING AND PHOTOCOPYING'
  })
  const [companyNameAr, setCompanyNameAr] = useState(() => {
    return localStorage.getItem('inv_comp_name_ar') || 'المتخصص للكتابة والتصوير'
  })
  
  const [telEn, setTelEn] = useState(() => {
    return localStorage.getItem('inv_tel_en') || '026393960'
  })
  const [telAr, setTelAr] = useState(() => {
    return localStorage.getItem('inv_tel_ar') || '026393960'
  })

  const [poBoxEn, setPoBoxEn] = useState(() => {
    return localStorage.getItem('inv_pobox_en') || '75752'
  })
  const [poBoxAr, setPoBoxAr] = useState(() => {
    return localStorage.getItem('inv_pobox_ar') || '75752'
  })

  const [addressEn, setAddressEn] = useState(() => {
    return localStorage.getItem('inv_address_en') || 'Hamdan Street, Abu Dhabi'
  })
  const [addressAr, setAddressAr] = useState(() => {
    return localStorage.getItem('inv_address_ar') || 'شارع حمدان , ابوظبي'
  })

  // --- Invoice Metadata & Customer ---
  const [customerName, setCustomerName] = useState('Ebimon Achankunju Achankunju Daniel')
  const [invoiceDate, setInvoiceDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })

  // --- Invoice Items ---
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Marriage and Birth Certificates Translation', quantity: 3, rate: 40 },
    { id: '2', description: 'Sponsor File Open', quantity: 1, rate: 400 },
    { id: '3', description: 'Issue Entry Permit', quantity: 3, rate: 400 },
    { id: '4', description: 'Issue Residence Visa and Emirates ID', quantity: 3, rate: 900 }
  ])

  // --- Extra Terms & Notes ---
  const [taxRate, setTaxRate] = useState(0) // 0% default since template shows direct sum

  // --- UI Controls ---
  const [showSettings, setShowSettings] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // Save theme setting to localStorage
  useEffect(() => {
    localStorage.setItem('inv_dark_mode', JSON.stringify(darkMode))
  }, [darkMode])

  // Save company defaults to localStorage when edited
  useEffect(() => {
    localStorage.setItem('inv_comp_name_en', companyNameEn)
    localStorage.setItem('inv_comp_name_ar', companyNameAr)
    localStorage.setItem('inv_tel_en', telEn)
    localStorage.setItem('inv_tel_ar', telAr)
    localStorage.setItem('inv_pobox_en', poBoxEn)
    localStorage.setItem('inv_pobox_ar', poBoxAr)
    localStorage.setItem('inv_address_en', addressEn)
    localStorage.setItem('inv_address_ar', addressAr)
  }, [companyNameEn, companyNameAr, telEn, telAr, poBoxEn, poBoxAr, addressEn, addressAr])

  // --- Computations ---
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
  const taxAmount = (subtotal * taxRate) / 100
  const totalAmount = subtotal + taxAmount

  // Format Date to DD/MM/YYYY
  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return dateStr
  }

  // --- Handlers ---
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0
    }
    setItems([...items, newItem])
  }

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) {
      triggerToast('Receipt must have at least one item!')
      return
    }
    setItems(items.filter(item => item.id !== id))
  }

  const handleUpdateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        if (field === 'quantity') {
          const qty = parseInt(value)
          return { ...item, quantity: isNaN(qty) ? 0 : qty }
        }
        if (field === 'rate') {
          const rate = parseFloat(value)
          return { ...item, rate: isNaN(rate) ? 0 : rate }
        }
        return { ...item, [field]: value }
      }
      return item
    }))
  }

  const handleResetClick = () => {
    setShowConfirmModal(true)
  }

  const handleConfirmReset = () => {
    setCustomerName('')
    setInvoiceDate(new Date().toISOString().split('T')[0])
    setItems([{ id: Date.now().toString(), description: '', quantity: 1, rate: 0 }])
    setShowConfirmModal(false)
    triggerToast('Form reset successful')
  }

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleGeneratePdf = () => {
    triggerToast('Generating PDF...')
    window.print()
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 flex flex-col font-sans ${darkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-5 right-5 z-50 bg-violet-650 dark:bg-violet-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-violet-400 animate-bounce">
          <CheckCircle2 size={18} />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-6 text-slate-800 dark:text-slate-100 animate-scaleUp">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-450 p-2 rounded-lg">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Reset Receipt Form?</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed text-left">
              Are you sure you want to clear all receipt fields and start fresh? This action cannot be undone and will delete all line items.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-rose-650 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-500 text-white cursor-pointer transition-colors"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-violet-600 to-fuchsia-600 p-2.5 rounded-xl shadow-lg shadow-violet-500/20">
            <FileText className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">Special Typing Invoice Engine</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Typing & Photocopying Receipt Center</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Light/Dark Toggle Button */}
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-855 transition-all text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all border cursor-pointer ${
              showSettings
                ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20'
                : 'bg-white hover:bg-slate-50 border-slate-350 text-slate-700 dark:text-slate-300 dark:bg-slate-850 dark:hover:bg-slate-800 dark:border-slate-700'
            }`}
          >
            <Settings2 size={16} />
            <span>{showSettings ? 'Close Settings' : 'Header Details'}</span>
          </button>
          <button
            type="button"
            onClick={handleGeneratePdf}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-550 hover:to-fuchsia-550 text-white px-5 py-2.5 text-sm font-semibold rounded-lg shadow-lg shadow-violet-500/25 hover:shadow-violet-500/35 transition-all border border-violet-500/35 hover:scale-[1.02] cursor-pointer"
          >
            <Printer size={16} />
            <span>Print Receipt</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Input Editor Form */}
        <section className="w-full lg:w-1/2 p-6 overflow-y-auto border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 transition-colors duration-200">
          <div className="max-w-xl mx-auto space-y-6">
            
            {/* Collapsible Company Settings Form */}
            {showSettings && (
              <div className="bg-white border border-slate-250 dark:bg-slate-900/80 dark:border-violet-500/30 rounded-xl p-5 shadow-xl space-y-4 animate-fadeIn transition-colors duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider flex items-center gap-2">
                    <Settings2 size={14} />
                    Bilingual Header Details (Auto-saves)
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase mb-1">Company Name (EN)</label>
                    <input
                      type="text"
                      value={companyNameEn}
                      onChange={(e) => setCompanyNameEn(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase mb-1">Company Name (AR)</label>
                    <input
                      type="text"
                      value={companyNameAr}
                      onChange={(e) => setCompanyNameAr(e.target.value)}
                      dir="rtl"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase mb-1">Telephone (EN)</label>
                    <input
                      type="text"
                      value={telEn}
                      onChange={(e) => setTelEn(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase mb-1">Telephone (AR)</label>
                    <input
                      type="text"
                      value={telAr}
                      onChange={(e) => setTelAr(e.target.value)}
                      dir="rtl"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase mb-1">P.O. Box (EN)</label>
                    <input
                      type="text"
                      value={poBoxEn}
                      onChange={(e) => setPoBoxEn(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase mb-1">P.O. Box (AR)</label>
                    <input
                      type="text"
                      value={poBoxAr}
                      onChange={(e) => setPoBoxAr(e.target.value)}
                      dir="rtl"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase mb-1">Address (EN)</label>
                    <input
                      type="text"
                      value={addressEn}
                      onChange={(e) => setAddressEn(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase mb-1">Address (AR)</label>
                    <input
                      type="text"
                      value={addressAr}
                      onChange={(e) => setAddressAr(e.target.value)}
                      dir="rtl"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Customer & Invoice Meta Details */}
            <div className="bg-white border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm dark:shadow-none transition-colors duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-350 uppercase tracking-wider">Receipt Info</h3>
                <button
                  type="button"
                  onClick={handleResetClick}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-455 transition-colors cursor-pointer"
                >
                  <RotateCcw size={12} />
                  Reset Fields
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase mb-1">Receipt Date</label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase mb-1">M.r/Ms. (Client Name)</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    className="w-full bg-white border border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Items Entry */}
            <div className="bg-white border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm dark:shadow-none transition-colors duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-855 pb-2">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-350 uppercase tracking-wider">Line Items</h3>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-1 bg-violet-50 hover:bg-violet-100 text-violet-600 border border-violet-200 dark:bg-violet-600/30 dark:hover:bg-violet-600/50 dark:text-violet-300 dark:border-violet-500/25 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer"
                >
                  <Plus size={12} />
                  Add Line
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={item.id} className="flex gap-3 items-start border-b border-slate-100 dark:border-slate-850 pb-3 last:border-0 last:pb-0">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-3 w-4">
                      {index + 1}
                    </span>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        placeholder="Description (e.g. Marriage Translation)"
                        value={item.description}
                        onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                        className="w-full bg-white border border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-violet-500"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-550 dark:text-slate-400 uppercase mb-0.5">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity === 0 ? '' : item.quantity}
                            onChange={(e) => handleUpdateItem(item.id, 'quantity', e.target.value)}
                            className="w-full bg-white border border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg px-2.5 py-1 text-sm text-center focus:outline-none focus:border-violet-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-550 dark:text-slate-400 uppercase mb-0.5">Unit Price</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0.00"
                            value={item.rate === 0 ? '' : item.rate}
                            onChange={(e) => handleUpdateItem(item.id, 'rate', e.target.value)}
                            className="w-full bg-white border border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg px-2.5 py-1 text-sm text-center focus:outline-none focus:border-violet-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-550 dark:text-slate-400 uppercase mb-0.5">Total</label>
                          <div className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800/60 rounded-lg px-2.5 py-1 text-sm font-semibold text-slate-650 dark:text-slate-400 text-right">
                            {(item.quantity * item.rate)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-slate-400 dark:text-slate-500 hover:text-rose-505 dark:hover:text-rose-455 p-1 mt-6 rounded hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Optional Tax settings (Hidden on Receipt, but editable) */}
            <div className="bg-white border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm dark:shadow-none transition-colors duration-200">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-350 uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-2">
                VAT / Tax Settings
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase mb-1">VAT / Tax Rate (%)</label>
                <input
                  type="number"
                  value={taxRate}
                  min="0"
                  max="100"
                  onChange={(e) => setTaxRate(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full bg-white border border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

          </div>
        </section>

        {/* Right Side: Interactive Invoice Preview */}
        <section className="w-full lg:w-1/2 p-6 bg-slate-100 dark:bg-slate-900/60 overflow-y-auto flex justify-center items-start border-t lg:border-t-0 border-slate-200 dark:border-slate-800 transition-colors duration-200">
          {/* A4 Sheet Wrapper */}
          <div 
            id="invoice-preview"
            className="w-full max-w-[720px] aspect-[1/1.414] bg-white text-black shadow-2xl rounded-xl p-10 md:p-14 relative flex flex-col justify-between border border-slate-200 select-none animate-fadeIn"
            style={{ minHeight: '850px', fontFamily: '"Times New Roman", Times, serif' }}
          >
            {/* Top Details & Bilingual Branding */}
            <div>
              {/* Bilingual Logo Header */}
              <div className="text-center space-y-1 pb-4">
                <h2 className="text-2xl font-extrabold text-black" style={{ fontFamily: 'initial' }}>{companyNameAr}</h2>
                <h1 className="text-xl font-bold tracking-wide text-black">{companyNameEn}</h1>
              </div>

              {/* Tel / Box metadata split */}
              <div className="flex justify-between items-start text-xs font-bold leading-normal pb-4 border-b border-black text-black">
                {/* Left Side: English */}
                <div className="text-left space-y-0.5">
                  <p>Tel: {telEn}</p>
                  <p>P.O.Box: {poBoxEn}</p>
                  <p>{addressEn}</p>
                </div>

                {/* Right Side: Arabic */}
                <div className="text-right space-y-0.5" dir="rtl">
                  <p>تلفون: {telAr}</p>
                  <p>ص.ب : {poBoxAr}</p>
                  <p>{addressAr}</p>
                </div>
              </div>

              {/* Date line */}
              <div className="py-6 text-left">
                <p className="text-sm font-bold text-black">Date: {formatDate(invoiceDate)}</p>
              </div>

              {/* Center Bill Type Title */}
              <div className="text-center py-6">
                <h3 className="text-lg font-bold border border-black/0 inline-block px-4 py-1 text-black">
                  Receipt/فاتورة
                </h3>
              </div>

              {/* Customer Name Row */}
              <div className="flex items-end justify-between text-sm pb-1 mb-8 border-b border-black/80">
                <span className="font-bold text-black shrink-0 pr-2">M.r/Ms. –</span>
                <span className="flex-1 font-bold text-slate-900 border-none outline-none text-left bg-transparent text-sm">
                  {customerName}
                </span>
                <span className="font-bold text-black shrink-0 pl-2" dir="rtl">السيد/السادة –</span>
              </div>

              {/* Items Grid/Table (Matches bilingual format but cleaner) */}
              <div className="mt-4">
                <table className="w-full text-left border-collapse border border-black text-black">
                  <thead>
                    <tr className="border-b border-black text-xs font-bold text-center">
                      <th className="py-2.5 px-2 border-r border-black w-12">رقم<br />S.No</th>
                      <th className="py-2.5 px-3 border-r border-black text-left">التفاصيل Description</th>
                      <th className="py-2.5 px-2 border-r border-black w-14">Qty</th>
                      <th className="py-2.5 px-2 border-r border-black w-24">سعر الوحدة<br />Unit Price</th>
                      <th className="py-2.5 px-3 w-28 text-right">المبلغ الاجمالي<br />Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={item.id} className="border-b border-black text-xs text-center font-bold">
                        <td className="py-3 px-2 border-r border-black">{idx + 1}</td>
                        <td className="py-3 px-3 border-r border-black text-left font-bold">{item.description || <span className="text-slate-400 italic font-normal">No description</span>}</td>
                        <td className="py-3 px-2 border-r border-black">{item.quantity}</td>
                        <td className="py-3 px-2 border-r border-black">{item.rate || ''}</td>
                        <td className="py-3 px-3 text-right font-bold">{(item.quantity * item.rate) || ''}</td>
                      </tr>
                    ))}
                    
                    {/* Add extra blank rows for receipt look (up to 6 total rows) */}
                    {items.length < 6 && Array.from({ length: 6 - items.length }).map((_, idx) => (
                      <tr key={`blank-${idx}`} className="border-b border-black text-xs h-9">
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black"></td>
                        <td></td>
                      </tr>
                    ))}

                    {/* Tax row if applicable */}
                    {taxRate > 0 && (
                      <tr className="border-b border-black text-xs font-bold">
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black text-right px-3" colSpan={3}>Tax ({taxRate}%):</td>
                        <td className="py-2 px-3 text-right">{taxAmount.toFixed(2)}</td>
                      </tr>
                    )}

                    {/* Total Grand Row */}
                    <tr className="text-xs font-extrabold text-center">
                      <td className="py-2.5 px-2 border-r border-black" colSpan={3}></td>
                      <td className="py-2.5 px-2 border-r border-black uppercase text-center">Total:</td>
                      <td className="py-2.5 px-3 text-right font-black">{totalAmount}/-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Signature Sections */}
            <div className="mt-12 pt-6">
              <div className="flex justify-between items-center text-sm font-bold text-black relative">
                
                {/* Receiver's Sign */}
                <div className="text-left w-1/3">
                  <p className="mt-8 border-t border-black/40 pt-1">Receiver's Sign</p>
                </div>

                {/* Stamp Placeholder overlay */}
                <div className="absolute left-[58%] -top-12 pointer-events-none select-none opacity-85">
                  <div className="w-24 h-24 rounded-full border-3 border-dashed border-blue-500/75 flex flex-col items-center justify-center text-[8px] text-blue-500/75 font-bold p-1 rotate-[15deg]">
                    <span className="text-[7px]">Tel: 02 6393960</span>
                    <span className="text-[7px]">P.O.Box: 75752</span>
                    <span className="text-[8px] font-black uppercase text-center tracking-tighter">SPECIAL TYPING</span>
                    <span className="text-[7px]">Abu Dhabi</span>
                    <span className="text-[8px] font-black text-center">SIGNATURE</span>
                  </div>
                </div>

                {/* Signature */}
                <div className="text-right w-1/3">
                  <p className="mt-8 border-t border-black/40 pt-1">Signature</p>
                </div>

              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  )
}

export default App
