import React, { useState, useRef } from 'react';
import { 
  User, 
  Truck, 
  CreditCard, 
  Settings as SettingsIcon, 
  Save, 
  Upload, 
  Image as ImageIcon, 
  CheckCircle, 
  Download,
  Plus,
  X,
  MapPin,
  Phone,
  Building2
} from 'lucide-react';
import { BusinessSettings } from '../types';

interface SettingsProps {
  settings: BusinessSettings;
  setSettings: React.Dispatch<React.SetStateAction<BusinessSettings>>;
  onExportData: () => void;
}

export default function Settings({ settings, setSettings, onExportData }: SettingsProps) {
  const [localSettings, setLocalSettings] = useState<BusinessSettings>(settings);
  const [imageStatus, setImageStatus] = useState<'idle' | 'uploading' | 'success'>(settings.storeLogo ? 'success' : 'idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newCourier, setNewCourier] = useState('');

  const handleSave = () => {
    setSettings(localSettings);
    // In a real app, we would persist this to a database
    alert('Settings saved successfully! (ترتیبات کامیابی کے ساتھ محفوظ ہو گئیں)');
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageStatus('uploading');
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalSettings({ ...localSettings, storeLogo: reader.result as string });
        setImageStatus('success');
      };
      reader.readAsDataURL(file);
    }
  };

  const addCourier = () => {
    if (newCourier.trim()) {
      setLocalSettings({
        ...localSettings,
        preferredCouriers: [...localSettings.preferredCouriers, newCourier.trim()]
      });
      setNewCourier('');
    }
  };

  const removeCourier = (index: number) => {
    const updated = [...localSettings.preferredCouriers];
    updated.splice(index, 1);
    setLocalSettings({ ...localSettings, preferredCouriers: updated });
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Business Profile */}
      <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
            <User size={20} />
          </div>
          <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Business Profile</h3>
        </div>
        <div className="p-8 space-y-8">
          <div className="flex flex-col items-center justify-center pb-6 border-b border-slate-100">
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-3xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group shadow-inner">
                {localSettings.storeLogo ? (
                  <img src={localSettings.storeLogo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={40} className="text-slate-300" />
                )}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Upload size={20} />
                </button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleLogoChange} 
                accept="image/*" 
                className="hidden" 
              />
              <div className="text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Store Logo</p>
                {imageStatus === 'success' && (
                  <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center justify-center gap-1">
                    <CheckCircle size={10} /> Logo Set
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto space-y-6 w-full">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">Business Name</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Enter your business name"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800 font-medium"
                  value={localSettings.businessName}
                  onChange={e => setLocalSettings({...localSettings, businessName: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">WhatsApp Business Number</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 group-focus-within:text-emerald-600 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.554 4.189 1.603 6.04L0 24l6.105-1.602a11.832 11.832 0 005.944 1.603h.005c6.634 0 12.032-5.396 12.035-12.03a11.85 11.85 0 00-3.536-8.509z"/>
                  </svg>
                </div>
                <input 
                  type="text" 
                  placeholder="e.g. +923001234567"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800 font-medium"
                  value={localSettings.whatsappNumber}
                  onChange={e => setLocalSettings({...localSettings, whatsappNumber: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">Business Address</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <textarea 
                  placeholder="Enter your complete business address"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800 font-medium min-h-[100px] resize-none"
                  value={localSettings.businessAddress}
                  onChange={e => setLocalSettings({...localSettings, businessAddress: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courier & Shipping */}
      <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
            <Truck size={20} />
          </div>
          <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Courier & Shipping</h3>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-400 uppercase">Preferred Couriers</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Add courier (e.g. TCS)"
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={newCourier}
                onChange={e => setNewCourier(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addCourier()}
              />
              <button 
                onClick={addCourier}
                className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <Plus size={24} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {localSettings.preferredCouriers.map((courier, idx) => (
                <span key={idx} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 border border-slate-200">
                  {courier}
                  <button onClick={() => removeCourier(idx)} className="text-slate-400 hover:text-rose-500">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Default Delivery Charges</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">{localSettings.currencySymbol}</span>
              <input 
                type="number" 
                className="w-full pl-12 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={localSettings.defaultDeliveryCharges}
                onChange={e => setLocalSettings({...localSettings, defaultDeliveryCharges: Number(e.target.value)})}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 italic">This will be pre-filled in new orders.</p>
          </div>
        </div>
      </section>

      {/* Payment Accounts */}
      <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
            <CreditCard size={20} />
          </div>
          <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Payment Accounts</h3>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Bank Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              value={localSettings.bankName || ''}
              onChange={e => setLocalSettings({...localSettings, bankName: e.target.value})}
              placeholder="e.g. Meezan Bank"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Account Title</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              value={localSettings.accountTitle || ''}
              onChange={e => setLocalSettings({...localSettings, accountTitle: e.target.value})}
              placeholder="e.g. Ahmed Ali"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">EasyPaisa Number</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              value={localSettings.easyPaisaNumber || ''}
              onChange={e => setLocalSettings({...localSettings, easyPaisaNumber: e.target.value})}
              placeholder="03XX-XXXXXXX"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">JazzCash Number</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              value={localSettings.jazzCashNumber || ''}
              onChange={e => setLocalSettings({...localSettings, jazzCashNumber: e.target.value})}
              placeholder="03XX-XXXXXXX"
            />
          </div>
        </div>
      </section>

      {/* App Preferences */}
      <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
            <SettingsIcon size={20} />
          </div>
          <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">App Preferences</h3>
        </div>
        <div className="p-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-8">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Currency Symbol</label>
              <div className="bg-slate-100 p-1 rounded-xl flex items-center">
                <button 
                  onClick={() => setLocalSettings({...localSettings, currencySymbol: 'PKR'})}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${localSettings.currencySymbol === 'PKR' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                >
                  PKR
                </button>
                <button 
                  onClick={() => setLocalSettings({...localSettings, currencySymbol: 'Rs.'})}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${localSettings.currencySymbol === 'Rs.' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                >
                  Rs.
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={onExportData}
            className="bg-slate-800 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-3 hover:bg-slate-900 transition-all shadow-lg"
          >
            <Download size={20} />
            Export Data to Excel
          </button>
        </div>
      </section>

      {/* Developer Signature */}
      <div className="pt-8 pb-12 text-center select-none pointer-events-none">
        <p className="text-[10px] text-slate-300 font-light tracking-[0.4em] uppercase">
          App Developer Hafiz Sufyan Naeem
        </p>
      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button 
          onClick={handleSave}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/40 hover:scale-105 active:scale-95"
        >
          <Save size={24} />
          Save Settings
        </button>
      </div>
    </div>
  );
}
