"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Check,
  ChevronDown, 
  HelpCircle, 
  Plus, 
  Trash2, 
  Upload, 
  X,
  UploadCloud,
  FileText
} from 'lucide-react';

type Vendor = {
  id: string;
  companyName: string;
  email: string;
};

type Props = {
  activeVendors: Vendor[];
  initialData?: any;
};

type RFQItem = {
  id: string;
  name: string;
  description: string;
  unit: string;
  quantity: number;
  price: number;
};

export default function CreateRFQClient({ activeVendors, initialData }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saveDraftLoading, setSaveDraftLoading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const [items, setItems] = useState<RFQItem[]>([
    { id: '1', name: '', description: '', unit: 'PCS', quantity: 1, price: 0 }
  ]);
  
  const [deadline, setDeadline] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  
  const [selectedVendors, setSelectedVendors] = useState<Vendor[]>([]);
  const [vendorSearch, setVendorSearch] = useState('');
  const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);

  const [attachments, setAttachments] = useState<{name: string, url: string}[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Load initialData if present
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      
      if (initialData.deadline) {
        // Format ISO string to datetime-local format (YYYY-MM-DDThh:mm)
        const date = new Date(initialData.deadline);
        const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
        const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);
        setDeadline(localISOTime);
      }
      
      setCurrency(initialData.currency || 'INR');
      setDeliveryLocation(initialData.deliveryLocation || '');

      if (initialData.items && initialData.items.length > 0) {
        setItems(initialData.items.map((item: any) => ({
          id: item.id,
          name: item.itemName,
          description: item.description || '',
          unit: item.unit,
          quantity: item.quantity,
          price: Number(item.estimatedCost) || 0
        })));
      }

      if (initialData.vendors && initialData.vendors.length > 0) {
        const preSelected = initialData.vendors.map((v: any) => v.vendor);
        setSelectedVendors(preSelected);
      }

      if (initialData.attachments && initialData.attachments.length > 0) {
        setAttachments(initialData.attachments.map((a: any) => ({
          name: a.fileName,
          url: a.fileUrl
        })));
      }
    }
  }, [initialData]);

  // Calculations
  const totalItems = items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  const estimatedValue = items.reduce((acc, item) => acc + ((Number(item.quantity) || 0) * (Number(item.price) || 0)), 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency }).format(value);
  };

  const handleAddItem = () => {
    setItems([...items, { id: Math.random().toString(), name: '', description: '', unit: 'PCS', quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof RFQItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const toggleVendor = (vendor: Vendor) => {
    if (selectedVendors.find(v => v.id === vendor.id)) {
      setSelectedVendors(selectedVendors.filter(v => v.id !== vendor.id));
    } else {
      setSelectedVendors([...selectedVendors, vendor]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploadingFile(true);
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      
      setAttachments([...attachments, { name: file.name, url: data.url }]);
    } catch (error) {
      console.error(error);
      alert("Failed to upload file");
    } finally {
      setUploadingFile(false);
      // Reset the input
      e.target.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!title) {
      alert("Please enter an RFQ Title");
      return;
    }
    
    if (status === 'PUBLISHED') setLoading(true);
    else setSaveDraftLoading(true);

    try {
      const isEdit = !!initialData;
      const endpoint = isEdit ? `/api/rfqs/${initialData.id}` : '/api/rfqs';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          deadline,
          currency,
          deliveryLocation,
          status,
          items: items.map(i => ({
            name: i.name,
            description: i.description,
            unit: i.unit,
            quantity: Number(i.quantity),
            price: Number(i.price)
          })),
          vendorIds: selectedVendors.map(v => v.id),
          attachments: attachments
        })
      });

      if (!res.ok) throw new Error("Failed to save RFQ");
      
      router.push('/dashboard/rfqs');
      router.refresh();
      
    } catch (error) {
      console.error(error);
      alert("An error occurred while saving the RFQ.");
    } finally {
      setLoading(false);
      setSaveDraftLoading(false);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 max-w-[1600px] mx-auto pb-12">
      {/* Main Form Area */}
      <div className="flex-1 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <span>RFQs</span>
              <span className="mx-2">&gt;</span>
              <span className="text-gray-900 font-medium">Create RFQ</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{initialData ? 'Edit RFQ' : 'Create New RFQ'}</h1>
            <p className="text-sm text-gray-500 mt-1">Fill in the details below to create a new Request for Quotation</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => handleSubmit('DRAFT')}
              disabled={saveDraftLoading || loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0F8C58] bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <FileText size={16} />
              {saveDraftLoading ? "Saving..." : "Save Draft"}
            </button>
            <button 
              onClick={() => handleSubmit('PUBLISHED')}
              disabled={saveDraftLoading || loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0F8C58] rounded-lg hover:bg-emerald-700 transition-colors"
            >
              {loading ? "Publishing..." : "Publish RFQ"}
              <ChevronDown size={16} />
            </button>
          </div>
        </div>

        {/* Section 1: RFQ Information */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0F8C58] text-white text-xs font-bold">1</div>
            <h2 className="text-lg font-bold text-gray-900">RFQ Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RFQ Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter RFQ title"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RFQ Reference No.
              </label>
              <input
                type="text"
                disabled
                value={initialData?.rfqNumber || ''}
                placeholder="Auto generated"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description / Scope of Work <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              {/* Fake Toolbar */}
              <div className="flex items-center gap-2 bg-gray-50 border-b border-gray-300 px-3 py-2">
                <select className="text-sm bg-transparent border-none outline-none text-gray-700 cursor-pointer">
                  <option>Paragraph</option>
                </select>
                <div className="h-4 w-px bg-gray-300 mx-1"></div>
                <button className="p-1 hover:bg-gray-200 rounded text-gray-700 font-bold">B</button>
                <button className="p-1 hover:bg-gray-200 rounded text-gray-700 italic font-serif">I</button>
                <button className="p-1 hover:bg-gray-200 rounded text-gray-700 underline">U</button>
                <div className="h-4 w-px bg-gray-300 mx-1"></div>
                {/* Icons placeholder */}
                <span className="text-gray-400 text-xs tracking-widest">≡ ≡ ≡</span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter product/service details, specifications, terms and conditions..."
                rows={5}
                className="w-full p-4 text-sm focus:outline-none resize-y min-h-[120px]"
              />
              <div className="bg-white px-3 py-2 text-right text-xs text-gray-400 border-t border-gray-100">
                {description.length} / 2000
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Product / Service Details */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0F8C58] text-white text-xs font-bold">2</div>
            <h2 className="text-lg font-bold text-gray-900">Product / Service Details</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm mb-4">
              <thead>
                <tr className="text-gray-500 font-medium border-b border-gray-200">
                  <th className="pb-3 w-8">#</th>
                  <th className="pb-3 min-w-[200px]">Item / Service Name <span className="text-red-500">*</span></th>
                  <th className="pb-3 min-w-[200px]">Description</th>
                  <th className="pb-3 w-32">Unit <span className="text-red-500">*</span></th>
                  <th className="pb-3 w-24">Quantity <span className="text-red-500">*</span></th>
                  <th className="pb-3 w-32">Unit Price ({currency})</th>
                  <th className="pb-3 w-32 text-right">Total ({currency})</th>
                  <th className="pb-3 w-16 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="py-4 text-gray-500">{index + 1}</td>
                    <td className="py-4 pr-3">
                      <input 
                        type="text" 
                        value={item.name}
                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                        placeholder="Enter item or service"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 outline-none"
                      />
                    </td>
                    <td className="py-4 pr-3">
                      <input 
                        type="text" 
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Enter description"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 outline-none"
                      />
                    </td>
                    <td className="py-4 pr-3">
                      <select 
                        value={item.unit}
                        onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 outline-none bg-white"
                      >
                        <option value="PCS">Select unit</option>
                        <option value="PCS">Pieces (PCS)</option>
                        <option value="KG">Kilograms (KG)</option>
                        <option value="LTR">Liters (LTR)</option>
                        <option value="BOX">Boxes (BOX)</option>
                      </select>
                    </td>
                    <td className="py-4 pr-3">
                      <input 
                        type="number" 
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 outline-none text-center"
                      />
                    </td>
                    <td className="py-4 pr-3">
                      <input 
                        type="number" 
                        min="0"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                        placeholder="0.00"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 outline-none text-right"
                      />
                    </td>
                    <td className="py-4 font-semibold text-gray-900 text-right">
                      {((Number(item.quantity) || 0) * (Number(item.price) || 0)).toFixed(2)}
                    </td>
                    <td className="py-4 text-center">
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 pt-4 mt-2">
            <div className="flex items-center gap-3 w-full sm:w-auto mb-4 sm:mb-0">
              <button 
                onClick={handleAddItem}
                className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Plus size={16} /> Add Item
              </button>
              <button className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Upload size={16} /> Import Items
              </button>
            </div>
            <div className="flex items-center gap-4 bg-emerald-50 px-6 py-3 rounded-xl border border-emerald-100 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-sm font-bold text-gray-700">Total Estimated Value ({currency})</span>
              <span className="text-xl font-bold text-[#0F8C58]">{estimatedValue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Section 3: RFQ Settings */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0F8C58] text-white text-xs font-bold">3</div>
            <h2 className="text-lg font-bold text-gray-900">RFQ Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deadline for Submission <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-emerald-500 outline-none text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency <span className="text-red-500">*</span>
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-emerald-500 outline-none bg-white"
              >
                <option value="INR">INR - Indian Rupee</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Location
              </label>
              <input
                type="text"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                placeholder="Enter delivery location"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Attachments */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0F8C58] text-white text-xs font-bold">4</div>
            <h2 className="text-lg font-bold text-gray-900">Attachments</h2>
          </div>

          <label className="border-2 border-dashed border-emerald-200 bg-emerald-50/50 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-emerald-50 transition-colors relative">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              onChange={handleFileUpload}
              disabled={uploadingFile}
            />
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-[#0F8C58] mb-4">
              <UploadCloud size={24} />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              {uploadingFile ? "Uploading..." : <><span className="text-[#0F8C58]">Click to browse</span> or drag & drop files here</>}
            </p>
            <p className="text-xs text-gray-500">
              Supports: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 10MB each)
            </p>
          </label>

          {attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              {attachments.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-gray-500" />
                    <a href={file.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-gray-700 hover:text-emerald-600 hover:underline">
                      {file.name}
                    </a>
                  </div>
                  <button onClick={() => removeAttachment(i)} className="text-gray-400 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 5: Assign Vendors */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0F8C58] text-white text-xs font-bold">5</div>
            <h2 className="text-lg font-bold text-gray-900">Assign Vendors</h2>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Vendors <span className="text-red-500">*</span>
            </label>
            <div 
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm flex items-center justify-between cursor-text bg-white"
              onClick={() => setIsVendorDropdownOpen(true)}
            >
              <input 
                type="text"
                placeholder="Search vendors by name, email or GST..."
                className="flex-1 outline-none border-none bg-transparent"
                value={vendorSearch}
                onChange={(e) => setVendorSearch(e.target.value)}
                onFocus={() => setIsVendorDropdownOpen(true)}
              />
              <ChevronDown size={16} className="text-gray-400" />
            </div>

            {isVendorDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-100 p-2 flex justify-end">
                  <button onClick={() => setIsVendorDropdownOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={16} />
                  </button>
                </div>
                {activeVendors.filter(v => v.companyName.toLowerCase().includes(vendorSearch.toLowerCase())).length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No vendors found
                  </div>
                ) : (
                  activeVendors.filter(v => v.companyName.toLowerCase().includes(vendorSearch.toLowerCase())).map(vendor => {
                    const isSelected = selectedVendors.some(sv => sv.id === vendor.id);
                    return (
                      <div 
                        key={vendor.id}
                        onClick={() => toggleVendor(vendor)}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{vendor.companyName}</p>
                          <p className="text-xs text-gray-500">{vendor.email}</p>
                        </div>
                        {isSelected && <Check size={16} className="text-[#0F8C58]" />}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Selected Vendors Pills */}
            {selectedVendors.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedVendors.map(v => (
                  <div key={v.id} className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700">
                    {v.companyName}
                    <button onClick={() => toggleVendor(v)} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Right Sidebar */}
      <div className="w-full xl:w-80 flex flex-col gap-6">
        
        {/* RFQ Summary Sticky Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sticky top-6">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
            <FileText size={20} className="text-[#0F8C58]" />
            <h2 className="text-lg font-bold text-gray-900">RFQ Summary</h2>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">RFQ Title</p>
              <p className="text-sm font-medium text-gray-900">{title || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Reference No.</p>
              <p className="text-sm font-medium text-gray-900">{initialData?.rfqNumber || 'Auto generated'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Items</p>
                <p className="text-sm font-medium text-gray-900">{totalItems}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Attachments</p>
                <p className="text-sm font-medium text-gray-900">{attachments.length}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Estimated Value ({currency})</p>
              <p className="text-lg font-bold text-[#0F8C58]">{estimatedValue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Deadline</p>
              <p className="text-sm font-medium text-gray-900">
                {deadline ? new Date(deadline).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Assigned Vendors</p>
              <p className="text-sm font-medium text-gray-900">{selectedVendors.length}</p>
            </div>
          </div>
        </div>

        {/* Tips Card */}
        <div className="bg-[#f0fdf4] rounded-xl border border-[#dcfce7] p-6">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle size={20} className="text-[#0F8C58]" />
            <h2 className="text-lg font-bold text-[#166534]">Tips</h2>
          </div>
          <ul className="space-y-4 text-sm text-[#166534]">
            <li className="flex items-start gap-2">
              <Check size={16} className="text-[#0F8C58] mt-0.5 shrink-0" />
              <span>Provide clear and detailed information to get accurate quotations.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-[#0F8C58] mt-0.5 shrink-0" />
              <span>Add all relevant attachments like specifications, drawings, terms, etc.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-[#0F8C58] mt-0.5 shrink-0" />
              <span>Assign appropriate vendors to ensure competitive quotes.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-[#0F8C58] mt-0.5 shrink-0" />
              <span>Set a realistic deadline for better responses.</span>
            </li>
          </ul>
        </div>
        
      </div>
    </div>
  );
}
