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

  // --- Company Settings (persisted in localStorage) ---
  const [companyName, setCompanyName] = useState(() => {
    return localStorage.getItem('inv_company_name') || 'APEX TYPING & SERVICES'
  })
  const [companyAddress, setCompanyAddress] = useState(() => {
    return localStorage.getItem('inv_company_address') || '123 Business Boulevard, Suite 400\nCity Center, CC 54321'
  })
  const [companyPhone, setCompanyPhone] = useState(() => {
    return localStorage.getItem('inv_company_phone') || '+1 (555) 019-9283'
  })
  const [companyEmail, setCompanyEmail] = useState(() => {
    return localStorage.getItem('inv_company_email') || 'billing@apextyping.com'
  })
  const [companyWebsite, setCompanyWebsite] = useState(() => {
    return localStorage.getItem('inv_company_website') || 'www.apextyping.com'
  })

  // --- Invoice Metadata & Customer ---
  const [customerName, setCustomerName] = useState('Acme Corporation')
  const [customerAddress, setCustomerAddress] = useState('456 Industrial Parkway\nWarehouse District, WD 98765')
  const [customerEmail, setCustomerEmail] = useState('accounts@acme.com')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [dueDate, setDueDate] = useState(() => {
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    return nextWeek.toISOString().split('T')[0]
  })

  // --- Invoice Items ---
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Legal Document Typing & Formatting (50 pages)', quantity: 1, rate: 150.00 },
    { id: '2', description: 'Speed Typing & Transcription Service (Audio)', quantity: 4, rate: 45.00 },
    { id: '3', description: 'Resume Review & Custom Styling', quantity: 2, rate: 75.00 }
  ])

  // --- Extra Terms & Notes ---
  const [taxRate, setTaxRate] = useState(5) // Default 5% tax
  const [invoiceNotes, setInvoiceNotes] = useState('Payment is requested within 7 days of invoice date. Thank you for choosing Apex Typing & Services!')
  const [paymentDetails, setPaymentDetails] = useState('Bank: Global Merchant Bank\nAccount: 1234-5678-9012\nSwift: GMBUS33XXX')

  // --- UI Controls ---
  const [showSettings, setShowSettings] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // Save theme setting to localStorage
  useEffect(() => {
    localStorage.setItem('inv_dark_mode', JSON.stringify(darkMode))
  }, [darkMode])

  // Auto-generate invoice number on mount if empty
  useEffect(() => {
    if (!invoiceNumber) {
      const year = new Date().getFullYear()
      const rand = Math.floor(1000 + Math.random() * 9000)
      setInvoiceNumber(`INV-${year}-${rand}`)
    }
  }, [])

  // Save company defaults to localStorage when edited
  useEffect(() => {
    localStorage.setItem('inv_company_name', companyName)
    localStorage.setItem('inv_company_address', companyAddress)
    localStorage.setItem('inv_company_phone', companyPhone)
    localStorage.setItem('inv_company_email', companyEmail)
    localStorage.setItem('inv_company_website', companyWebsite)
  }, [companyName, companyAddress, companyPhone, companyEmail, companyWebsite])

  // --- Computations ---
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
  const taxAmount = (subtotal * taxRate) / 100
  const totalAmount = subtotal + taxAmount

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
      triggerToast('Invoice must have at least one item!')
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
    setCustomerAddress('')
    setCustomerEmail('')
    setInvoiceDate(new Date().toISOString().split('T')[0])
    setDueDate(() => {
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      return nextWeek.toISOString().split('T')[0]
    })
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
    // Temporarily trigger native window print for validation
    window.print()
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 flex flex-col font-sans ${darkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-slate-55 text-slate-800'}`}>
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
              <div className="bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 p-2 rounded-lg">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Reset Invoice Form?</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed text-left">
              Are you sure you want to clear all invoice fields and start fresh? This action cannot be undone and will delete all line items.
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
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">Apex Invoice Engine</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Typing Center Invoice Generator</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Light/Dark Toggle Button */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-850 transition-all text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all border cursor-pointer ${
              showSettings
                ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20'
                : 'bg-white hover:bg-slate-50 border-slate-350 dark:bg-slate-85 transition-all text-slate-700 dark:text-slate-300 dark:bg-slate-850 dark:hover:bg-slate-800 dark:border-slate-700'
            }`}
          >
            <Settings2 size={16} />
            <span>{showSettings ? 'Close Settings' : 'Company Settings'}</span>
          </button>
          <button
            onClick={handleGeneratePdf}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-550 hover:to-fuchsia-550 text-white px-5 py-2.5 text-sm font-semibold rounded-lg shadow-lg shadow-violet-500/25 hover:shadow-violet-500/35 transition-all border border-violet-500/35 hover:scale-[1.02] cursor-pointer"
          >
            <Printer size={16} />
            <span>Generate PDF</span>
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
                    Company Settings (Auto-saves)
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase mb-1">Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase mb-1">Address</label>
                    <textarea
                      rows={2}
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase mb-1">Phone</label>
                    <input
                      type="text"
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase mb-1">Email</label>
                    <input
                      type="text"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase mb-1">Website</label>
                    <input
                      type="text"
                      value={companyWebsite}
                      onChange={(e) => setCompanyWebsite(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Customer & Invoice Meta Details */}
            <div className="bg-white border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm dark:shadow-none transition-colors duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-350 uppercase tracking-wider">Invoice Info</h3>
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
                  <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="e.g. INV-2026-1002"
                    className="w-full bg-white border border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase mb-1">Issue Date</label>
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase mb-1">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase mb-1">Client Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer/business name"
                    className="w-full bg-white border border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase mb-1">Client Address</label>
                  <textarea
                    rows={2}
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Enter client street address, city, zip"
                    className="w-full bg-white border border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase mb-1">Client Email</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="client@company.com"
                    className="w-full bg-white border border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Items Entry */}
            <div className="bg-white border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm dark:shadow-none transition-colors duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
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
                        placeholder="Description (e.g. Arabic typing services)"
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
                            step="0.01"
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
                            ${(item.quantity * item.rate).toFixed(2)}
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

            {/* Terms, Tax Rate, and Notes */}
            <div className="bg-white border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm dark:shadow-none transition-colors duration-200">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-350 uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-2">
                Extra Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    value={taxRate}
                    min="0"
                    max="100"
                    onChange={(e) => setTaxRate(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full bg-white border border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase mb-1">Payment Details / Bank</label>
                  <textarea
                    rows={2}
                    value={paymentDetails}
                    onChange={(e) => setPaymentDetails(e.target.value)}
                    placeholder="Enter Swift/IBAN details"
                    className="w-full bg-white border border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase mb-1">Invoice Notes / Footer</label>
                  <textarea
                    rows={2}
                    value={invoiceNotes}
                    onChange={(e) => setInvoiceNotes(e.target.value)}
                    placeholder="e.g. Thank you for your business!"
                    className="w-full bg-white border border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Right Side: Interactive Invoice Preview */}
        <section className="w-full lg:w-1/2 p-6 bg-slate-100 dark:bg-slate-900/60 overflow-y-auto flex justify-center items-start border-t lg:border-t-0 border-slate-200 dark:border-slate-800 transition-colors duration-200">
          {/* A4 Sheet Wrapper */}
          <div 
            id="invoice-preview"
            className="w-full max-w-[720px] aspect-[1/1.414] bg-white text-slate-800 shadow-2xl rounded-xl p-8 md:p-12 relative flex flex-col justify-between border border-slate-200 select-none animate-fadeIn"
            style={{ minHeight: '850px' }}
          >
            {/* Top Details & Branding */}
            <div>
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 pb-8 border-b border-slate-200">
                {/* Typing Center Info */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-slate-900 text-white p-1.5 rounded-lg">
                      <FileText size={20} />
                    </div>
                    <span className="font-extrabold text-lg tracking-tight text-slate-900">{companyName}</span>
                  </div>
                  <div className="text-xs text-slate-500 leading-relaxed whitespace-pre-line">
                    {companyAddress}
                  </div>
                </div>

                {/* Additional Company Contact Details */}
                <div className="text-left md:text-right text-xs text-slate-500 space-y-0.5">
                  <p className="font-semibold text-slate-800">Contact Details</p>
                  <p>Phone: {companyPhone}</p>
                  <p>Email: {companyEmail}</p>
                  <p className="text-violet-650 font-medium">{companyWebsite}</p>
                </div>
              </div>

              {/* Invoice Meta Grid */}
              <div className="grid grid-cols-2 gap-4 py-8 border-b border-slate-100">
                {/* Client Info */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To</p>
                  <p className="font-bold text-sm text-slate-900">{customerName || '—'}</p>
                  {customerAddress && (
                    <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line mt-1">
                      {customerAddress}
                    </p>
                  )}
                  {customerEmail && (
                    <p className="text-xs text-slate-500 mt-1">{customerEmail}</p>
                  )}
                </div>

                {/* Invoice Meta details */}
                <div className="text-right space-y-3">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">INVOICE</h2>
                    <p className="text-xs font-mono font-semibold text-violet-600 bg-violet-50 inline-block px-2 py-0.5 rounded">
                      {invoiceNumber || 'DRAFT'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 text-right justify-end text-xs">
                    <span className="text-slate-400">Date Issued:</span>
                    <span className="font-semibold text-slate-850">{invoiceDate}</span>
                    <span className="text-slate-400">Due Date:</span>
                    <span className="font-semibold text-slate-850">{dueDate}</span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mt-8">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-2 w-8 text-center">#</th>
                      <th className="py-2">Description</th>
                      <th className="py-2 w-16 text-center">Qty</th>
                      <th className="py-2 w-24 text-right">Unit Price</th>
                      <th className="py-2 w-28 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={item.id} className="border-b border-slate-100 text-xs text-slate-700 hover:bg-slate-50/50">
                        <td className="py-3 text-center text-slate-400">{idx + 1}</td>
                        <td className="py-3 font-medium text-slate-800 pr-4">{item.description || <span className="text-slate-350 italic">No description</span>}</td>
                        <td className="py-3 text-center">{item.quantity}</td>
                        <td className="py-3 text-right">${item.rate.toFixed(2)}</td>
                        <td className="py-3 text-right font-semibold text-slate-900">${(item.quantity * item.rate).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Calculations & Notes */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                
                {/* Notes & Bank Details */}
                <div className="w-full md:w-3/5 space-y-4">
                  {paymentDetails && (
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bank Payment Details</h4>
                      <p className="text-[10px] text-slate-500 whitespace-pre-line leading-relaxed">
                        {paymentDetails}
                      </p>
                    </div>
                  )}
                  {invoiceNotes && (
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Notes / Terms</h4>
                      <p className="text-[10px] text-slate-500 italic whitespace-pre-line leading-relaxed">
                        {invoiceNotes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Final Calculation Summaries */}
                <div className="w-full md:w-2/5 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="font-semibold text-slate-700">${subtotal.toFixed(2)}</span>
                  </div>
                  {taxRate > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">VAT / Tax ({taxRate}%)</span>
                      <span className="font-semibold text-slate-700">${taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 my-1"></div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm font-bold text-slate-800">Total Due</span>
                    <span className="text-lg font-black text-violet-650">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>

              </div>

              {/* Small stamp / footer */}
              <div className="mt-10 pt-4 border-t border-slate-100 flex justify-between items-center text-[9px] text-slate-400">
                <p>Generated automatically via Apex Invoice Engine</p>
                <p className="font-medium text-slate-500">Thank you for your business!</p>
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  )
}

export default App
