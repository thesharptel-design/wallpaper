import React, { useState, useEffect } from 'react';
import { saveApiKey, getApiKey, removeApiKey } from '../services/storageService';
import { validateApiKey } from '../services/geminiService';
import { Lock, CheckCircle, AlertCircle, X, Key, Save, Trash2 } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated: (key: string | null) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeyUpdated }) => {
  const [inputKey, setInputKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [storedKeyExists, setStoredKeyExists] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const currentKey = getApiKey();
      if (currentKey) {
        setInputKey(currentKey);
        setStoredKeyExists(true);
        setStatus('idle'); // Don't re-validate immediately to save quota, user can click test
      } else {
        setStoredKeyExists(false);
        setInputKey('');
      }
    }
  }, [isOpen]);

  const handleSaveAndTest = async () => {
    if (!inputKey.trim()) return;

    setStatus('validating');
    const isValid = await validateApiKey(inputKey);

    if (isValid) {
      saveApiKey(inputKey);
      setStoredKeyExists(true);
      setStatus('valid');
      onKeyUpdated(inputKey);
      setTimeout(() => {
          onClose();
      }, 1000);
    } else {
      setStatus('invalid');
    }
  };

  const handleClear = () => {
    removeApiKey();
    setInputKey('');
    setStoredKeyExists(false);
    setStatus('idle');
    onKeyUpdated(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-400" />
            API 키 관리
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-slate-300">
              Google Gemini API 키를 입력해주세요. 키는 로컬 드라이브에 안전하게 암호화되어 저장됩니다.
            </p>
            <p className="text-xs text-slate-500">
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
                여기에서 키 발급받기
              </a>
            </p>
          </div>

          <div className="relative">
            <input
              type="password"
              value={inputKey}
              onChange={(e) => {
                setInputKey(e.target.value);
                setStatus('idle');
              }}
              placeholder="AIza..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <div className="absolute right-3 top-3">
               {status === 'validating' && <div className="animate-spin h-5 w-5 border-2 border-indigo-500 rounded-full border-t-transparent"></div>}
               {status === 'valid' && <CheckCircle className="w-5 h-5 text-green-500" />}
               {status === 'invalid' && <AlertCircle className="w-5 h-5 text-red-500" />}
            </div>
          </div>
          
          {status === 'invalid' && (
            <p className="text-sm text-red-400">키가 유효하지 않거나 연결할 수 없습니다. 다시 확인해주세요.</p>
          )}
          
          {status === 'valid' && (
             <p className="text-sm text-green-400">연결 성공! 키가 저장되었습니다.</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSaveAndTest}
              disabled={status === 'validating' || !inputKey}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${
                status === 'validating' || !inputKey
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
              }`}
            >
              <Save className="w-4 h-4" />
              저장 및 연결 테스트
            </button>
            
            {storedKeyExists && (
              <button
                onClick={handleClear}
                className="px-4 py-3 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                title="키 삭제"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-3 flex items-start gap-2">
            <Lock className="w-4 h-4 text-slate-400 mt-0.5" />
            <p className="text-xs text-slate-400">
              보안 알림: API 키는 서버로 전송되지 않으며, 브라우저의 로컬 스토리지에 암호화되어 저장됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;