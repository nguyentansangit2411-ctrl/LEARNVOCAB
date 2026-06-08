"use client";

import { useState, useEffect } from 'react';
import { StudyMeta } from '@/lib/types';
import { getMeta, updateMeta } from '@/lib/storage';
import { X, Send, Save, Mail, AlertTriangle, RefreshCw, Clock } from 'lucide-react';
import emailjs from 'emailjs-com';

interface EmailReminderProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailReminder({ isOpen, onClose }: EmailReminderProps) {
  const [meta, setMeta] = useState<StudyMeta | null>(null);
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean, msg: string} | null>(null);
  
  const [activeTab, setActiveTab] = useState<'send' | 'settings'>('send');
  const [hours, setHours] = useState(2);

  useEffect(() => {
    if (isOpen) {
      setMeta(getMeta());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen || !meta) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMeta({ ...meta, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    updateMeta(meta);
    setTestResult({ success: true, msg: "Đã lưu cài đặt!" });
    setTimeout(() => setTestResult(null), 3000);
  };

  const isConfigured = meta.emailJS_serviceId && meta.emailJS_templateId && meta.emailJS_publicKey && meta.userEmail;

  const handleTest = async () => {
    if (!isConfigured) {
      setTestResult({ success: false, msg: "Vui lòng điền đủ thông tin!" });
      return;
    }
    
    setIsTestLoading(true);
    setTestResult(null);
    
    try {
      await emailjs.send(
        meta.emailJS_serviceId,
        meta.emailJS_templateId,
        {
          to_email: meta.userEmail,
          time_ago: "Test ngay lập tức",
          studied_today: 0,
          due_today: 0,
          streak: meta.streak,
          app_url: window.location.origin
        },
        meta.emailJS_publicKey
      );
      setTestResult({ success: true, msg: "Gửi email thành công! Kiểm tra hộp thư." });
    } catch (err: any) {
      setTestResult({ success: false, msg: `Lỗi: ${err.text || err.message || 'Không xác định'}` });
    } finally {
      setIsTestLoading(false);
    }
  };

  const handleSchedule = () => {
    if (!isConfigured) {
      setActiveTab('settings');
      return;
    }
    
    alert(`Đã hẹn giờ nhắc nhở sau ${hours} giờ. (Lưu ý: Bạn cần giữ tab này mở để gửi email do app không có backend)`);
    
    setTimeout(async () => {
      try {
        await emailjs.send(
          meta.emailJS_serviceId,
          meta.emailJS_templateId,
          {
            to_email: meta.userEmail,
            time_ago: `${hours} giờ trước`,
            studied_today: 0,
            due_today: 0,
            streak: meta.streak,
            app_url: window.location.origin
          },
          meta.emailJS_publicKey
        );
      } catch (e) {}
    }, hours * 3600 * 1000);
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-5 border-b border-border">
          <h2 className="text-xl font-bold text-text flex items-center gap-2">
            <Mail className="text-primary" /> Nhắc nhở học tập
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text bg-surface-2 p-1.5 rounded-md transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-border">
          <button 
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'send' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text'}`}
            onClick={() => setActiveTab('send')}
          >
            Hẹn giờ
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text'}`}
            onClick={() => setActiveTab('settings')}
          >
            Cài đặt EmailJS
          </button>
        </div>
        
        <div className="p-5">
          {activeTab === 'settings' ? (
            <div className="space-y-4">
              <div className="bg-info/10 border border-info/30 p-3 rounded-lg text-sm text-text-muted mb-4">
                Đăng ký miễn phí tại <a href="https://emailjs.com" target="_blank" rel="noreferrer" className="text-info hover:underline">emailjs.com</a> để lấy thông tin.
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Email nhận thông báo</label>
                <input type="email" name="userEmail" value={meta.userEmail} onChange={handleChange} placeholder="your@email.com" className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Service ID</label>
                <input type="text" name="emailJS_serviceId" value={meta.emailJS_serviceId} onChange={handleChange} placeholder="service_xxxxx" className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Template ID</label>
                <input type="text" name="emailJS_templateId" value={meta.emailJS_templateId} onChange={handleChange} placeholder="template_xxxxx" className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Public Key</label>
                <input type="text" name="emailJS_publicKey" value={meta.emailJS_publicKey} onChange={handleChange} placeholder="xxx_xxxxxxxxxx" className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
              
              {testResult && (
                <div className={`p-3 rounded-lg text-sm ${testResult.success ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                  {testResult.msg}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={handleTest} disabled={isTestLoading} className="flex-1 py-2 bg-surface-2 text-text rounded-lg hover:bg-border transition-colors font-medium disabled:opacity-50 flex justify-center items-center gap-2">
                  {isTestLoading ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />} Test gửi
                </button>
                <button onClick={handleSave} className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium flex justify-center items-center gap-2 shadow-lg shadow-primary/20">
                  <Save size={18} /> Lưu
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-2">
              {!isConfigured ? (
                <div className="text-center py-6">
                  <AlertTriangle className="mx-auto text-warning mb-3" size={40} />
                  <p className="text-text-muted mb-4">Bạn chưa cấu hình EmailJS để gửi mail.</p>
                  <button onClick={() => setActiveTab('settings')} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover font-medium">Cài đặt ngay</button>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <p className="text-text-muted mb-4">Nhắc tôi ôn bài sau:</p>
                    <div className="flex justify-center gap-3">
                      {[1, 2, 4, 8].map(h => (
                        <button 
                          key={h}
                          onClick={() => setHours(h)}
                          className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg transition-all ${hours === h ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110 border-none' : 'bg-surface-2 text-text-muted hover:bg-border border border-transparent'}`}
                        >
                          {h}h
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button onClick={handleSchedule} className="w-full py-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors font-bold flex justify-center items-center gap-2 shadow-lg shadow-primary/20 mt-4">
                    <Clock size={20} /> Bắt đầu đếm ngược
                  </button>
                  <p className="text-xs text-text-muted text-center italic mt-4">
                    Lưu ý: Bạn không được đóng trình duyệt để tính năng đếm ngược hoạt động.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
