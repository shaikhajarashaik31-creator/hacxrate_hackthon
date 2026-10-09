import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import { Award, Printer, CheckCircle2, ShieldCheck, Download, Calendar, ExternalLink } from 'lucide-react';

export function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewCert, setViewCert] = useState(null);

  useEffect(() => {
    async function loadCerts() {
      try {
        const res = await api.get('/student/certificates');
        setCertificates(Array.isArray(res.data) ? res.data : (res.data?.certificates || []));
      } catch (err) {
        console.error('Failed to load certificates:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCerts();
  }, []);

  if (loading) {
    return <Loader text="Loading your verified credentials and certificates..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Verified Course Certificates</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              {certificates.length} Earned
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Official verifiable credentials issued upon 100% completion of advanced industry electives
          </p>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Certificates Earned Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Enroll in and complete 100% of an advanced elective (such as Advanced Generative AI or System Design) to earn your unique verified certificate!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-3xl p-6 border border-amber-200/80 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between space-y-4 relative overflow-hidden group"
            >
              {/* Gold Ribbon Accent */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full opacity-20 pointer-events-none group-hover:scale-125 transition duration-500" />

              <div>
                <div className="flex items-center justify-between text-xs text-amber-800 font-bold mb-2">
                  <span className="flex items-center space-x-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Verified Credential</span>
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">{cert.certificate_code}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                  {cert.course_title}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                  {cert.course_description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Issued Date:</span>
                    <strong className="text-slate-800">{new Date(cert.issued_at).toLocaleDateString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Instructor:</span>
                    <strong className="text-slate-800">{cert.teacher_name || 'Faculty Committee'}</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setViewCert(cert)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 flex items-center justify-center space-x-2"
              >
                <Award className="w-4 h-4" />
                <span>View & Print Certificate</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Printable Certificate Modal */}
      <Modal
        isOpen={!!viewCert}
        onClose={() => setViewCert(null)}
        title="Official Verified Certificate"
        maxWidth="max-w-4xl"
      >
        {viewCert && (
          <div className="space-y-6">
            {/* The Certificate Frame */}
            <div className="print-container relative bg-white border-8 border-double border-amber-600/60 p-8 sm:p-12 rounded-2xl shadow-inner text-center selection:bg-amber-100 overflow-hidden">
              {/* Corner Ornaments */}
              <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-700" />
              <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-700" />
              <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-700" />
              <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-700" />

              {/* Watermark Crest */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <Award className="w-96 h-96 text-amber-900" />
              </div>

              <div className="relative z-10 space-y-5">
                <div className="flex items-center justify-center space-x-2 text-indigo-700 font-extrabold text-sm tracking-widest uppercase">
                  <span>EduPulse AI Academy of Engineering</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-tight text-slate-900">
                  Certificate of Academic Excellence
                </h1>

                <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                  This is proudly presented to
                </p>

                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-indigo-900 border-b-2 border-amber-300 inline-block px-8 pb-2">
                  {viewCert.student_name}
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                  For outstanding academic proficiency and successful mastery of all rigorous assessment modules in
                </p>

                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {viewCert.course_title}
                </h3>

                <div className="grid grid-cols-3 gap-4 pt-8 max-w-xl mx-auto border-t border-slate-200 items-center">
                  <div className="text-center">
                    <div className="font-handwriting text-xl text-slate-800 border-b border-slate-400 pb-1">
                      {viewCert.teacher_name || 'Dr. Arthur Pendelton'}
                    </div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">Lead Instructor</p>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${window.location.origin}/verify/${viewCert.certificate_code}`)}`}
                      alt="Verification QR Code"
                      className="w-16 h-16 border-2 border-slate-200 rounded-lg p-1 bg-white shadow-sm"
                    />
                    <span className="text-[8px] font-mono text-slate-400 mt-0.5">Scan to Verify</span>
                  </div>

                  <div className="text-center">
                    <div className="font-handwriting text-xl text-slate-800 border-b border-slate-400 pb-1">
                      Academic Dean
                    </div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">Verification Authority</p>
                  </div>
                </div>

                <div className="pt-4 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between border-t border-slate-100">
                  <span>Issued: {new Date(viewCert.issued_at).toLocaleDateString()}</span>
                  <span className="font-mono font-bold text-amber-700">ID: {viewCert.certificate_code}</span>
                  <a
                    href={`/verify/${viewCert.certificate_code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline flex items-center space-x-1"
                  >
                    <span>Verify Credential</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Print & Download Action Buttons */}
            <div className="flex items-center justify-end space-x-3 no-print">
              <button
                onClick={() => setViewCert(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Close Preview
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm flex items-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Download PDF</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Certificates;
