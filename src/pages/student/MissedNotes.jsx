import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  Search,
  CheckCircle2,
  BookmarkCheck,
  Sparkles,
  Layers,
  FileQuestion,
  Calendar,
  Filter,
  PlusCircle,
  HelpCircle
} from 'lucide-react';

export function MissedNotes() {
  const [searchParams] = useSearchParams();
  const queryCourseId = searchParams.get('course_id');
  const queryDate = searchParams.get('class_date');

  const [sessions, setSessions] = useState([]);
  const [pastClasses, setPastClasses] = useState([]);
  const [selectedSessionIndex, setSelectedSessionIndex] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0); // 0 to N-1
  const [viewMode, setViewMode] = useState('notebook'); // 'notebook' | 'toc'

  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Request notes modal state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqCourseId, setReqCourseId] = useState('');
  const [reqDate, setReqDate] = useState('');
  const [reqTopic, setReqTopic] = useState('');
  const [requesting, setRequesting] = useState(false);

  const fetchNotes = async () => {
    try {
      const res = await api.get('/student/notes', {
        params: { search: searchQuery }
      });
      const sessList = res.data?.sessions || [];
      setSessions(sessList);
      setPastClasses(res.data?.pastClasses || []);

      if (sessList.length > 0) {
        if (queryCourseId && queryDate) {
          const matchedIdx = sessList.findIndex(
            s => String(s.course_id) === String(queryCourseId) && s.class_date === queryDate
          );
          if (matchedIdx !== -1) {
            setSelectedSessionIndex(matchedIdx);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [searchQuery]);

  const currentSession = sessions[selectedSessionIndex] || null;
  const currentPages = currentSession?.pages || [];
  const safePageCount = currentPages.length || 0;
  const currentPage = currentPages[Math.min(Math.max(currentPageIndex, 0), Math.max(safePageCount - 1, 0))] || null;

  const clampPageIndex = (nextIndex) => {
    if (!currentPages.length) return 0;
    return Math.min(Math.max(nextIndex, 0), currentPages.length - 1);
  };

  const getPrintableHtml = (session, pages) => {
    const pageMarkup = pages.map((page, idx) => {
      const pageNumber = page.page_number || idx + 1;
      const pageKind = page.page_type || page.type || (page.image_url || page.src ? 'image' : 'text');
      const content = page.content || '';
      const diagram = page.svg_diagram ? `<div style="margin-top:24px;">${page.svg_diagram}</div>` : '';
      const media =
        pageKind === 'image' || page.image_url || page.src
          ? `<img src="${page.image_url || page.src}" alt="Page ${pageNumber}" style="max-width:100%; border-radius:18px; margin:20px auto; display:block;" />`
          : pageKind === 'pdf' || page.pdf_url
            ? `<iframe src="${page.pdf_url}" title="Page ${pageNumber}" style="width:100%; min-height:720px; border:0; margin-top:12px;" />`
            : '';

      return `
        <section style="page-break-after: always; page-break-inside: avoid; border:1px solid #e2e8f0; border-radius:14px; padding:28px; margin:18px 0; background:#fff;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; font-family:Arial, sans-serif; color:#111827; margin-bottom:18px;">
            <div>
              <div style="font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#6b7280;">${(session?.course_title || 'Study Notes').replace(/&/g, '&amp;')}</div>
              <h2 style="margin:6px 0 0; font-size:26px; font-weight:700;">${(page.title || `Page ${pageNumber}`).replace(/&/g, '&amp;')}</h2>
            </div>
            <div style="font-size:12px; font-weight:700; color:#7c3aed; background:#f3e8ff; border-radius:999px; padding:7px 12px;">Page ${pageNumber}</div>
          </div>
          ${media}
          <div style="white-space: pre-wrap; font-size:18px; line-height:1.8; font-family:Georgia, serif; color:#0f172a;">${(content || 'No content available for this page.').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          ${diagram}
        </section>
      `;
    }).join('');

    return `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${(session?.course_title || 'Study Notes').replace(/&/g, '&amp;')} — Print View</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; background: #f8fafc; color: #0f172a; }
            section { box-shadow: 0 8px 30px rgba(15, 23, 42, 0.06); }
            img { max-width: 100%; height: auto; }
            @media print { body { background: #fff; } section { box-shadow: none; } }
          </style>
        </head>
        <body>
          <div style="max-width: 1000px; margin: 0 auto;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; background:#fff; padding:18px 20px; border:1px solid #e2e8f0; border-radius:16px;">
              <div>
                <div style="font-size:12px; letter-spacing:0.18em; text-transform:uppercase; color:#6b7280;">Study Material</div>
                <h1 style="margin:6px 0 0; font-size:30px; font-weight:800;">${(session?.course_title || 'Study Notes').replace(/&/g, '&amp;')}</h1>
              </div>
              <div style="font-size:12px; font-weight:700; color:#7c3aed;">${pages.length} pages</div>
            </div>
            ${pageMarkup}
          </div>
        </body>
      </html>`;
  };

  useEffect(() => {
    if (!currentPages.length) {
      setCurrentPageIndex(0);
      return;
    }

    setCurrentPageIndex((prev) => clampPageIndex(prev));
  }, [currentPages.length]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!currentSession || !currentPages.length) return;
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') return;

      if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        event.preventDefault();
        setCurrentPageIndex((prev) => clampPageIndex(prev + 1));
      }

      if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        setCurrentPageIndex((prev) => clampPageIndex(prev - 1));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentSession, currentPages.length]);

  const handleDownloadNotes = async () => {
    if (!currentSession || !currentPages.length) {
      alert('No study notes available to download.');
      return;
    }

    try {
      const sourceUrl = currentPage?.pdf_url || currentPage?.file_url || currentPage?.url || currentPage?.image_url || currentPage?.src;
      if (sourceUrl) {
        const response = await fetch(sourceUrl);
        if (!response.ok) throw new Error('Source file unavailable');
        const blob = await response.blob();
        const link = document.createElement('a');
        const extension = sourceUrl.split('?')[0].split('.').pop() || 'pdf';
        const filename = `${(currentSession.course_title || 'study-notes').replace(/\s+/g, '-').toLowerCase()}.${extension}`;
        const objectUrl = URL.createObjectURL(blob);
        link.href = objectUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
        return;
      }

      const html = getPrintableHtml(currentSession, currentPages);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `${(currentSession.course_title || 'study-notes').replace(/\s+/g, '-').toLowerCase()}.html`;
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download notes:', error);
      alert('Download failed. Please try again or use the browser print option.');
    }
  };

  const handlePrint = () => {
    if (!currentSession || !currentPages.length) {
      alert('No study notes available to print.');
      return;
    }

    try {
      const sourceUrl = currentPage?.pdf_url || currentPage?.file_url || currentPage?.url || currentSession?.pdf_url;
      if (sourceUrl) {
        const printWindow = window.open(sourceUrl, '_blank', 'noopener,noreferrer');
        if (printWindow) {
          setTimeout(() => {
            try {
              printWindow.focus();
              printWindow.print();
            } catch (err) {
              console.error('Failed to print original document:', err);
            }
          }, 600);
        }
        return;
      }

      const printWindow = window.open('', '_blank', 'noopener,noreferrer');
      if (!printWindow) {
        alert('Your browser blocked the print dialog. Please allow pop-ups for this page.');
        return;
      }

      printWindow.document.write(getPrintableHtml(currentSession, currentPages));
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 250);
    } catch (error) {
      console.error('Failed to print notes:', error);
      alert('Print failed. Please try again.');
    }
  };

  const renderNotebookPage = () => {
    if (!currentPage) {
      return (
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center text-slate-500">
          <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 text-sm font-semibold">This notebook page is not available.</p>
        </div>
      );
    }

    const pageKind = currentPage.page_type || currentPage.type || (currentPage.image_url || currentPage.src ? 'image' : 'text');

    if (pageKind === 'image' || currentPage.image_url || currentPage.src) {
      return (
        <div className="mx-auto max-w-3xl rounded-3xl border border-amber-200 bg-white p-4 shadow-sm">
          <img
            src={currentPage.image_url || currentPage.src}
            alt={currentPage.title || `Page ${currentPage.page_number || currentPageIndex + 1}`}
            className="w-full rounded-2xl object-contain"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
              event.currentTarget.parentElement.innerHTML = '<div class="text-center text-slate-500 p-8"><p class="font-bold">Image could not be loaded.</p><p class="text-xs mt-2">Please choose another page or refresh the notebook.</p></div>';
            }}
          />
        </div>
      );
    }

    if (pageKind === 'pdf' || currentPage.pdf_url) {
      return (
        <div className="rounded-3xl border border-amber-200 bg-white p-3 shadow-sm">
          <iframe
            src={currentPage.pdf_url || currentPage.url}
            title={currentPage.title || `Page ${currentPage.page_number || currentPageIndex + 1}`}
            className="w-full min-h-[700px] rounded-2xl border-0"
          />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {currentPage.title && (
          <div className="mb-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-indigo-900 underline decoration-indigo-300 decoration-wavy">
              {currentPage.title}
            </h3>
          </div>
        )}

        {currentPage.content ? (
          <div className="text-xl sm:text-2xl leading-[32px] text-slate-800 whitespace-pre-line tracking-wide">
            {currentPage.content}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
            No content is available for this page. Please move to another page or generate new notes.
          </div>
        )}

        {currentPage.svg_diagram && (
          <div className="my-6 p-4 rounded-2xl bg-white/60 border border-amber-300 shadow-sm max-w-lg mx-auto">
            <div
              dangerouslySetInnerHTML={{ __html: currentPage.svg_diagram }}
              className="w-full flex justify-center"
            />
            <p className="text-center text-sm font-sans font-semibold text-slate-500 mt-2">
              Figure: Conceptual Architecture & Invariant Flow
            </p>
          </div>
        )}
      </div>
    );
  };

  // Toggle revised status
  const handleToggleRevised = async () => {
    if (!currentPage) return;
    try {
      await api.post('/student/notes/toggle-revised', {
        page_id: currentPage.id
      });
      // Update local state
      const updatedSessions = [...sessions];
      const targetSession = updatedSessions[selectedSessionIndex];
      if (targetSession && targetSession.pages[currentPageIndex]) {
        targetSession.pages[currentPageIndex].is_revised = targetSession.pages[currentPageIndex].is_revised ? 0 : 1;
        setSessions(updatedSessions);
      }
    } catch (err) {
      console.error('Failed to toggle revision status:', err);
    }
  };

  // Request new AI synthesized notes for any past class
  const handleRequestNotes = async (e) => {
    e.preventDefault();
    if (!reqCourseId || !reqDate) return;
    setRequesting(true);

    try {
      await api.post('/student/notes/request', {
        course_id: reqCourseId,
        class_date: reqDate,
        topic: reqTopic
      });
      setShowRequestModal(false);
      setReqTopic('');
      await fetchNotes();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to synthesize notes. Please retry.');
    } finally {
      setRequesting(false);
    }
  };

  const coursesList = [...new Set(sessions.map(s => s.course_title))];
  const filteredSessions = courseFilter === 'All'
    ? sessions
    : sessions.filter(s => s.course_title === courseFilter);

  if (loading) {
    return <Loader text="Opening your handwritten notebook..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Handwritten Notebook</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              AI Multi-Page Synthesis
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Realistic notebook with lined paper, red margin line, Caveat font, multi-page breakdowns, and SVG illustrations.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 flex-wrap">
          <button
            onClick={() => setShowRequestModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Request Past Notes</span>
          </button>

          <button
            onClick={handleDownloadNotes}
            className="px-3.5 py-2 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition"
            title="Download notes"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download Notes</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition"
            title="Print notes"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Print Notes</span>
          </button>
        </div>
      </div>

      {/* Filter and Mode Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs no-print">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics or concepts..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          />
        </div>

        <div className="flex items-center space-x-2">
          {/* Course Filter Dropdown */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none"
          >
            <option value="All">All Courses ({coursesList.length})</option>
            {coursesList.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* View Toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'notebook' ? 'toc' : 'notebook')}
            className={`px-3 py-2 rounded-xl font-bold border transition flex items-center space-x-1.5 ${
              viewMode === 'toc'
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-600" />
            <span>{viewMode === 'toc' ? 'View Notebook' : 'Table of Contents'}</span>
          </button>
        </div>
      </div>

      {/* Table of Contents View */}
      {viewMode === 'toc' && (
        <div className="p-8 rounded-3xl bg-amber-50/60 border border-amber-200 shadow-md space-y-6 max-w-4xl mx-auto font-['Caveat',cursive]">
          <div className="border-b-2 border-amber-300 pb-3">
            <h2 className="text-3xl font-black text-amber-950 tracking-wide text-center">
              📓 Notebook Table of Contents
            </h2>
            <p className="text-sm text-amber-800 text-center font-sans font-medium mt-1">
              Click any lecture entry to flip directly to its handwritten notes
            </p>
          </div>

          <div className="space-y-4">
            {filteredSessions.map((sess, sIdx) => (
              <div
                key={sIdx}
                onClick={() => {
                  setSelectedSessionIndex(sIdx);
                  setCurrentPageIndex(0);
                  setViewMode('notebook');
                }}
                className="p-4 rounded-2xl bg-white/80 border border-amber-200 hover:border-amber-400 hover:shadow-md transition cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-amber-900 group-hover:text-indigo-600 transition">
                      {sess.course_title}
                    </span>
                    {sess.isRevised && (
                      <span className="font-sans px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                        <BookmarkCheck className="w-3 h-3" />
                        <span>Revised</span>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 font-sans mt-0.5">
                    Class Date: {sess.class_date} &bull; Taught by {sess.teacher_name || 'Faculty'}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-lg font-bold text-amber-700">
                    {sess.pageCount} Pages &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Realistic Handwritten Notebook View */}
      {viewMode === 'notebook' && currentSession && (
        <div className="space-y-4 max-w-4xl mx-auto">
          {/* Lecture Navigation Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-2 text-xs no-print">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-700">Lecture Session:</span>
              <select
                value={selectedSessionIndex}
                onChange={(e) => {
                  setSelectedSessionIndex(Number(e.target.value));
                  setCurrentPageIndex(0);
                }}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-indigo-700 shadow-sm focus:outline-none"
              >
                {filteredSessions.map((s, idx) => (
                  <option key={idx} value={idx}>
                    {s.course_title} ({s.class_date})
                  </option>
                ))}
              </select>
            </div>

            {/* Revised Checkbox */}
            <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
              <input
                type="checkbox"
                checked={Boolean(currentPage?.is_revised)}
                onChange={handleToggleRevised}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span className="flex items-center space-x-1">
                <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                <span>Mark Page as Revised</span>
              </span>
            </label>
          </div>

          {/* The Physical Notebook Page Representation */}
          <div className="relative bg-[#fefce8] rounded-3xl shadow-2xl border border-amber-200/80 overflow-hidden min-h-[680px] print:shadow-none print:border-none print-container">
            {/* Left Spiral Binding Visual */}
            <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-12 bg-amber-100/60 border-r border-amber-300 flex flex-col justify-between py-6 z-10 pointer-events-none">
              {Array.from({ length: 14 }).map((_, sIdx) => (
                <div key={sIdx} className="flex items-center justify-center">
                  {/* Spiral wire loop */}
                  <div className="w-5 h-2.5 rounded-full bg-slate-400 border border-slate-600 shadow-inner -ml-2" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-900/40 -ml-1" />
                </div>
              ))}
            </div>

            {/* Vertical Pink / Red Margin Line */}
            <div className="absolute left-16 sm:left-20 top-0 bottom-0 w-[2px] bg-rose-400/80 z-10 pointer-events-none" />

            {/* Notebook Lined Paper Body */}
            <div className="notebook-paper pl-20 sm:pl-28 pr-6 sm:pr-12 pt-8 pb-16 min-h-[680px] text-slate-800 font-['Caveat',cursive]">
              {/* Top Page Header (Date & Lecture metadata) */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b-2 border-slate-300/80 pb-2 mb-6">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-wide">
                    {currentSession.course_title}
                  </h2>
                  <p className="text-base text-slate-500 mt-0.5">
                    Lecture Date: {currentSession.class_date} &bull; Taught by {currentSession.teacher_name || 'Prof. Jenkins'}
                  </p>
                </div>

                <div className="text-right mt-2 sm:mt-0">
                  <span className="text-lg font-bold text-amber-800 px-3 py-1 bg-amber-100/80 rounded-full border border-amber-200">
                    Page {currentPage?.page_number || currentPageIndex + 1} of {currentPages.length || 5}
                  </span>
                </div>
              </div>

              {renderNotebookPage()}

              {/* Page Stamp Indicator */}
              {currentPage?.is_revised === 1 && (
                <div className="mt-8 inline-block px-4 py-1.5 rounded-xl border-2 border-emerald-600 bg-emerald-50 text-emerald-800 text-lg font-bold rotate-[-3deg] shadow-sm">
                  ✓ REVISED & VERIFIED
                </div>
              )}
            </div>

            <div className="px-5 pb-4 no-print">
              <div className="flex flex-wrap items-center justify-center gap-2 border-t border-amber-300/60 pt-4">
                {currentPages.map((page, idx) => (
                  <button
                    key={page.id || `${page.page_number || idx}-${idx}`}
                    type="button"
                    onClick={() => setCurrentPageIndex(clampPageIndex(idx))}
                    className={`min-w-[2.6rem] rounded-lg border px-2.5 py-1.5 text-xs font-bold transition ${
                      idx === currentPageIndex
                        ? 'border-violet-500 bg-violet-600 text-white shadow-sm'
                        : 'border-amber-200 bg-amber-50 text-amber-900 hover:border-violet-300 hover:text-violet-700'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Floating Page Navigation Footer */}
            <div className="absolute bottom-3 left-16 sm:left-24 right-4 sm:right-10 flex items-center justify-between text-xs font-sans no-print pt-2 border-t border-amber-300/60">
              <button
                disabled={!currentPages.length || currentPageIndex === 0}
                onClick={() => setCurrentPageIndex(prev => clampPageIndex(prev - 1))}
                className="px-4 py-2 bg-amber-200/70 hover:bg-amber-300 text-amber-950 font-bold rounded-xl flex items-center space-x-1.5 transition disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Page</span>
              </button>

              <span className="font-bold text-amber-900 text-sm">
                Page {Math.min(currentPageIndex + 1, currentPages.length || 1)} / {currentPages.length || 1}
              </span>

              <button
                disabled={!currentPages.length || currentPageIndex >= currentPages.length - 1}
                onClick={() => setCurrentPageIndex(prev => clampPageIndex(prev + 1))}
                className="px-4 py-2 bg-amber-200/70 hover:bg-amber-300 text-amber-950 font-bold rounded-xl flex items-center space-x-1.5 transition disabled:opacity-40"
              >
                <span>Next Page</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {viewMode === 'notebook' && !currentSession && (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 max-w-md mx-auto">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Missed Notes Found</h3>
          <p className="text-xs text-slate-500">
            You currently have 100% attendance or no missed lectures registered in this search. You can still generate notes for any past lecture below!
          </p>
          <button
            onClick={() => setShowRequestModal(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition"
          >
            Request Past Lecture Notes
          </button>
        </div>
      )}

      {/* Request Notes Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2 text-indigo-600">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-black text-slate-900">Request Lecture Notes</h3>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestNotes} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Select Course
                </label>
                <select
                  required
                  value={reqCourseId}
                  onChange={(e) => setReqCourseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="">-- Choose Course --</option>
                  {coursesList.map((cName, idx) => {
                    const found = sessions.find(s => s.course_title === cName) || pastClasses.find(p => p.course_title === cName);
                    const cId = found?.course_id || idx + 1;
                    return (
                      <option key={idx} value={cId}>
                        {cName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Class Date
                </label>
                <input
                  type="date"
                  required
                  value={reqDate}
                  onChange={(e) => setReqDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Topic or Key Focus (Optional)
                </label>
                <input
                  type="text"
                  value={reqTopic}
                  onChange={(e) => setReqTopic(e.target.value)}
                  placeholder="e.g. Memory allocation, Graph BFS, System Design"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requesting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {requesting ? 'Generating 5 Pages...' : 'Synthesize Notes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MissedNotes;
