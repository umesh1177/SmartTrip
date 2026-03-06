import React, { useState } from 'react';
import axios from 'axios';
import { Car, FileText, Landmark, CheckCircle, ChevronRight, Upload, Camera, Loader, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const DriverRegister = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        vehicleType: 'sedan',
        vehicleModel: '',
        vehicleColor: '',
        vehicleNumber: '',
        accountNumber: '',
        ifsc: '',
        accountName: ''
    });
    const [documents, setDocuments] = useState({
        license: null,
        rc: null,
        insurance: null
    });
    const [previews, setPreviews] = useState({
        license: null,
        rc: null,
        insurance: null
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e, docType) => {
        const file = e.target.files[0];
        if (file) {
            setDocuments({ ...documents, [docType]: file });
            setPreviews({ ...previews, [docType]: URL.createObjectURL(file) });
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            Object.keys(documents).forEach(key => data.append(key, documents[key]));

            await axios.post('/api/driver/register', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setStep(4);
            toast.success('Application submitted successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { id: 1, title: 'Vehicle Info', icon: <Car size={20} /> },
        { id: 2, title: 'Documents', icon: <FileText size={20} /> },
        { id: 3, title: 'Bank Details', icon: <Landmark size={20} /> },
    ];

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-12 px-4 flex items-center justify-center">
            <div className="max-w-xl w-full">
                {/* Progress Bar */}
                {step < 4 && (
                    <div className="flex justify-between mb-12 relative">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>
                        {steps.map((s) => (
                            <div key={s.id} className="flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${step >= s.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-400'}`}>
                                    {step > s.id ? <CheckCircle size={18} /> : s.icon}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s.id ? 'text-indigo-600' : 'text-gray-400'}`}>{s.title}</span>
                            </div>
                        ))}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white p-8 rounded-[40px] shadow-2xl border border-gray-100">
                            <h2 className="text-3xl font-black mb-8">Vehicle Details 🚗</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Vehicle Type</label>
                                    <select name="vehicleType" value={formData.vehicleType} onChange={handleInputChange} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 font-bold outline-none">
                                        <option value="bike">Bike</option>
                                        <option value="auto">Auto</option>
                                        <option value="sedan">Sedan</option>
                                        <option value="suv">SUV</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Model</label>
                                        <input type="text" name="vehicleModel" placeholder="e.g. Toyota Camry" value={formData.vehicleModel} onChange={handleInputChange} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 font-bold outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Color</label>
                                        <input type="text" name="vehicleColor" placeholder="e.g. White" value={formData.vehicleColor} onChange={handleInputChange} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 font-bold outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Number Plate</label>
                                    <input type="text" name="vehicleNumber" placeholder="e.g. KA-01-AB-1234" value={formData.vehicleNumber} onChange={handleInputChange} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 font-bold outline-none uppercase" />
                                </div>
                                <button onClick={() => setStep(2)} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 mt-8">
                                    Next Step <ChevronRight size={24} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white p-8 rounded-[40px] shadow-2xl border border-gray-100">
                            <h2 className="text-3xl font-black mb-8">Documents 📃</h2>
                            <div className="space-y-6">
                                {['license', 'rc', 'insurance'].map((doc) => (
                                    <div key={doc}>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{doc.replace('rc', 'RC Book')}</label>
                                        <div className="relative group">
                                            {previews[doc] ? (
                                                <div className="relative h-32 rounded-2xl overflow-hidden border-2 border-indigo-100">
                                                    <img src={previews[doc]} alt={doc} className="w-full h-full object-cover" />
                                                    <button onClick={() => setPreviews({ ...previews, [doc]: null })} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"><Upload size={14} /></button>
                                                </div>
                                            ) : (
                                                <label className="h-32 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all text-gray-400 group">
                                                    <Camera size={28} className="group-hover:text-indigo-600" />
                                                    <span className="text-xs font-bold mt-2">Upload {doc.toUpperCase()}</span>
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, doc)} />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div className="flex gap-4 mt-8">
                                    <button onClick={() => setStep(1)} className="flex-1 bg-gray-100 text-gray-600 py-5 rounded-3xl font-black">Back</button>
                                    <button onClick={() => setStep(3)} className="flex-[2] bg-indigo-600 text-white py-5 rounded-3xl font-black flex items-center justify-center gap-2">Next Step <ChevronRight size={24} /></button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white p-8 rounded-[40px] shadow-2xl border border-gray-100">
                            <h2 className="text-3xl font-black mb-8">Payout Setup 💰</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Account Number</label>
                                    <input type="text" name="accountNumber" placeholder="Enter bank account number" value={formData.accountNumber} onChange={handleInputChange} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 font-bold outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">IFSC Code</label>
                                        <input type="text" name="ifsc" placeholder="ABCD0123456" value={formData.ifsc} onChange={handleInputChange} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 font-bold outline-none uppercase" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Account Holder</label>
                                        <input type="text" name="accountName" placeholder="Name as per bank" value={formData.accountName} onChange={handleInputChange} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 font-bold outline-none" />
                                    </div>
                                </div>
                                <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4 text-amber-700">
                                    <AlertCircle className="flex-shrink-0" size={24} />
                                    <p className="text-xs font-bold leading-relaxed">By submitting, you agree to SmartTrip's 15% commission policy. Verification takes 24-48 hours.</p>
                                </div>
                                <div className="flex gap-4 mt-8">
                                    <button onClick={() => setStep(2)} className="flex-1 bg-gray-100 text-gray-600 py-5 rounded-3xl font-black">Back</button>
                                    <button onClick={handleSubmit} disabled={loading} className="flex-[2] bg-indigo-600 text-white py-5 rounded-3xl font-black flex items-center justify-center gap-2">
                                        {loading ? <Loader className="animate-spin" /> : 'Finish Application'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div key="step4" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center bg-white p-12 rounded-[40px] shadow-2xl border border-gray-100">
                            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-50">
                                <CheckCircle size={56} />
                            </div>
                            <h2 className="text-4xl font-black mb-4">Application Received! 🎉</h2>
                            <p className="text-gray-500 text-lg font-medium mb-12">We are reviewing your documents. You'll receive a notification and email once your account is verified.</p>
                            <button onClick={() => navigate('/explore')} className="bg-indigo-600 text-white px-12 py-5 rounded-3xl font-black text-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100">
                                Back to Explore
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default DriverRegister;
