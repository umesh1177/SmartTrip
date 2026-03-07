import { useState, useEffect } from "react";
import {
    CheckCircle, XCircle, Clock, AlertCircle, Eye,
    MessageSquare, Building2, MapPin, Mail, Phone,
    Star, LayoutGrid, List, Search, Filter, ChevronRight
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function HotelApplicationsPanel() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("pending");
    const [selectedApp, setSelectedApp] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(""); // "details", "approve", "revision", "reject"
    const [adminNote, setAdminNote] = useState("");

    const tabs = [
        { id: "pending", label: "Pending", icon: Clock },
        { id: "revision_needed", label: "Reviewing", icon: Eye },
        { id: "approved", label: "Approved", icon: CheckCircle },
        { id: "rejected", label: "Rejected", icon: XCircle }
    ];

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/admin/hotel-applications?status=${activeTab}`);
            if (res.data.success) {
                setApplications(res.data.applications);
            }
        } catch (error) {
            toast.error("Failed to load applications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, [activeTab]);

    const handleAction = async (type, id) => {
        try {
            let res;
            if (type === "approve") {
                res = await axios.put(`/api/admin/hotel-applications/${id}/approve`);
            } else if (type === "reject") {
                res = await axios.put(`/api/admin/hotel-applications/${id}/reject`, { reason: adminNote });
            } else if (type === "revision") {
                res = await axios.put(`/api/admin/hotel-applications/${id}/revision`, { notes: adminNote });
            }

            if (res.data.success) {
                toast.success(res.data.message);
                setShowModal(false);
                setAdminNote("");
                fetchApplications();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Action failed");
        }
    };

    const openAppModal = (app, type) => {
        setSelectedApp(app);
        setModalType(type);
        setShowModal(true);
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Tabs */}
            <div className="flex space-x-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 sticky top-0 z-10">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                : "text-gray-400 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                        {tab.id === 'pending' && applications.length > 0 && activeTab !== 'pending' && (
                            <span className="bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full ml-1">
                                {applications.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Cards Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-gray-200 rounded-3xl" />)}
                </div>
            ) : applications.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                    <Building2 size={64} className="mx-auto text-gray-200 mb-4" />
                    <h3 className="text-xl font-bold text-gray-400">No applications found in this section</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {applications.map(app => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={app._id}
                            className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group"
                        >
                            <div className="flex h-full flex-col md:flex-row">
                                {/* Image Section */}
                                <div className="md:w-52 h-64 md:h-auto relative overflow-hidden">
                                    <img src={app.mainImage} alt={app.hotelName} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                            {app.subscribedPlan || 'BASIC'} ⭐
                                        </span>
                                    </div>
                                </div>

                                {/* Info Section */}
                                <div className="flex-1 p-6 space-y-4">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{app.hotelName}</h3>
                                            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                                                {new Date(app.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 font-bold text-sm flex items-center gap-1">
                                            <MapPin size={14} className="text-blue-500" /> {app.city}, {app.state}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Owner</p>
                                            <p className="text-xs font-bold text-gray-800">{app.userId?.name || 'Partner'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</p>
                                            <p className="text-xs font-bold text-blue-600">₹{app.pricePerNight} <span className="text-gray-400">/ night</span></p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {Object.keys(app.amenities).filter(k => app.amenities[k]).slice(0, 4).map(k => (
                                            <span key={k} className="px-2 py-1 bg-gray-50 text-gray-500 text-[10px] font-bold rounded-md capitalize">
                                                {k}
                                            </span>
                                        ))}
                                        {Object.keys(app.amenities).filter(k => app.amenities[k]).length > 4 && (
                                            <span className="text-[10px] font-bold text-blue-500">+ more</span>
                                        )}
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => openAppModal(app, "details")}
                                            className="flex-grow py-3 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
                                        >
                                            <Eye size={14} /> View Details
                                        </button>
                                        {activeTab === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => openAppModal(app, "approve")}
                                                    className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-green-500/20 transition-all"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => openAppModal(app, "revision")}
                                                    className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
                                                >
                                                    Notes
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Action Modals */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-gray-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-full overflow-hidden flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight capitalize">
                                        {modalType === 'details' ? 'Full Application Details' : `${modalType} Application`}
                                    </h3>
                                    <p className="text-sm font-bold text-gray-500">{selectedApp?.hotelName} • {selectedApp?.city}</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all"><XCircle size={24} /></button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                                {modalType === 'details' ? (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <div className="md:col-span-2 space-y-8">
                                                <section>
                                                    <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4">Description</h4>
                                                    <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap bg-gray-50 p-6 rounded-3xl">{selectedApp.description}</p>
                                                </section>
                                                <section>
                                                    <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4">Room Types</h4>
                                                    <div className="overflow-hidden rounded-3xl border border-gray-100">
                                                        <table className="w-full text-left bg-white">
                                                            <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400">
                                                                <tr>
                                                                    <th className="px-6 py-4">Type</th>
                                                                    <th className="px-6 py-4">Price</th>
                                                                    <th className="px-6 py-4">Occupancy</th>
                                                                    <th className="px-6 py-4">Units</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-50 text-xs font-bold text-gray-700">
                                                                {selectedApp.roomTypes.map((room, i) => (
                                                                    <tr key={i}>
                                                                        <td className="px-6 py-4">{room.type}</td>
                                                                        <td className="px-6 py-4">₹{room.price}</td>
                                                                        <td className="px-6 py-4">{room.maxOccupancy} Persons</td>
                                                                        <td className="px-6 py-4">{room.quantity}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </section>
                                            </div>
                                            <div className="space-y-8">
                                                <section className="bg-gray-900 text-white p-6 rounded-3xl shadow-xl">
                                                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Contact & Plan</h4>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-white/10 rounded-lg"><Mail size={14} /></div>
                                                            <p className="text-xs font-bold truncate">{selectedApp.contactEmail}</p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-white/10 rounded-lg"><Phone size={14} /></div>
                                                            <p className="text-xs font-bold">{selectedApp.contactPhone}</p>
                                                        </div>
                                                        <div className="pt-4 border-t border-white/10">
                                                            <p className="text-[10px] font-black text-blue-400">SUBSCRIPTION</p>
                                                            <p className="text-lg font-black">{selectedApp.subscribedPlan || 'BASIC'}</p>
                                                        </div>
                                                    </div>
                                                </section>
                                                <section>
                                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Amenities</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {Object.keys(selectedApp.amenities).filter(k => selectedApp.amenities[k]).map(k => (
                                                            <span key={k} className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full capitalize">{k}</span>
                                                        ))}
                                                    </div>
                                                </section>
                                            </div>
                                        </div>
                                        <section>
                                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Gallery</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {selectedApp.galleryImages.map((img, i) => (
                                                    <img key={i} src={img} className="w-full h-32 object-cover rounded-2xl shadow-sm hover:scale-105 transition-all" alt="Gallery" />
                                                ))}
                                            </div>
                                        </section>
                                    </>
                                ) : (
                                    <div className="max-w-xl mx-auto py-10 text-center space-y-6">
                                        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${modalType === 'approve' ? 'bg-green-100 text-green-600' :
                                                modalType === 'revision' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                                            }`}>
                                            {modalType === 'approve' ? <CheckCircle size={40} /> : <AlertCircle size={40} />}
                                        </div>
                                        <h4 className="text-2xl font-black text-gray-900">
                                            {modalType === 'approve' ? 'Approve Listing?' :
                                                modalType === 'revision' ? 'Request Changes' : 'Reject Application'}
                                        </h4>
                                        <p className="text-gray-500 font-bold">
                                            {modalType === 'approve' ?
                                                'This will automatically create the hotel listing and notify the partner. They will be live on SmartTrip immediately.' :
                                                'Enter your notes or feedback below to help the partner improve their application.'}
                                        </p>
                                        {modalType !== 'approve' && (
                                            <textarea
                                                value={adminNote}
                                                onChange={(e) => setAdminNote(e.target.value)}
                                                placeholder={modalType === 'revision' ? "Tell them what to change..." : "Reason for rejection..."}
                                                className="w-full p-6 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 min-h-[150px] font-bold"
                                            />
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-4">
                                <button onClick={() => setShowModal(false)} className="px-8 py-3 text-gray-900 font-bold hover:bg-gray-200 rounded-2xl transition-all">Cancel</button>
                                {modalType !== 'details' && (
                                    <button
                                        onClick={() => handleAction(modalType, selectedApp._id)}
                                        className={`px-12 py-3 text-white rounded-2xl font-black text-sm shadow-xl transition-all active:scale-95 ${modalType === 'approve' ? 'bg-green-500 shadow-green-500/30' :
                                                modalType === 'revision' ? 'bg-amber-600 shadow-amber-600/30' : 'bg-red-600 shadow-red-600/30'
                                            }`}
                                    >
                                        Confirm {modalType}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
