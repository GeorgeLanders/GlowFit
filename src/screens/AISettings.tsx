import { useState } from 'react';
import { ArrowLeft, Check, ExternalLink, Shield, Zap, Settings } from 'lucide-react';
import { useGlowFitStore } from '../lib/store';
import { AI_PROVIDERS, detectProvider, type ProviderKey } from '../lib/provider-config';

const PROVIDER_LIST: ProviderKey[] = ['gemini', 'groq', 'openrouter', 'together', 'custom'];

export default function AISettingsScreen({ onBack }: { onBack: () => void }) {
  const { aiConfig, setAiMode, setAiProvider, setAiApiKey, setAiModel } = useGlowFitStore();
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [showKey, setShowKey] = useState(false);

  const provider = AI_PROVIDERS[aiConfig.provider as ProviderKey] || AI_PROVIDERS.gemini;

  const handleKeyChange = (key: string) => {
    setAiApiKey(key);
    // Auto-detect provider from key prefix
    const detected = detectProvider(key);
    if (detected) {
      const p = AI_PROVIDERS[detected];
      setAiProvider(detected, p.baseUrl, p.defaultModel);
    }
  };

  const handleProviderSelect = (pKey: ProviderKey) => {
    const p = AI_PROVIDERS[pKey];
    setAiProvider(pKey, p.baseUrl, p.defaultModel);
  };

  const testConnection = async () => {
    if (!aiConfig.apiKey) return;
    setTestStatus('testing');
    try {
      const response = await fetch(`${aiConfig.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: aiConfig.model,
          messages: [{ role: 'user', content: 'Say hi in 3 words' }],
          max_tokens: 20,
        }),
      });
      setTestStatus(response.ok ? 'success' : 'error');
      setTimeout(() => setTestStatus('idle'), 3000);
    } catch {
      setTestStatus('error');
      setTimeout(() => setTestStatus('idle'), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-rose-100">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-rose-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">AI Assistant</h1>
            <p className="text-xs text-gray-500">Configure your AI provider</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Privacy Notice */}
        <div className="flex items-start gap-3 p-4 bg-green-50 rounded-2xl border border-green-100">
          <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800">Your key stays on your device</p>
            <p className="text-xs text-green-600 mt-1">
              API keys are stored locally and never sent to our servers. They're used directly with your chosen AI provider.
            </p>
          </div>
        </div>

        {/* AI Mode Toggle */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">AI Mode</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setAiMode('app-default')}
              className={`p-4 rounded-2xl border-2 transition-all text-left ${
                aiConfig.mode === 'app-default'
                  ? 'border-rose-400 bg-rose-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-rose-500" />
                <span className="text-sm font-medium">App Default</span>
              </div>
              <p className="text-xs text-gray-500">Use the app's built-in AI (may have limits)</p>
            </button>
            <button
              onClick={() => setAiMode('bring-your-own-key')}
              className={`p-4 rounded-2xl border-2 transition-all text-left ${
                aiConfig.mode === 'bring-your-own-key'
                  ? 'border-rose-400 bg-rose-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-4 h-4 text-rose-500" />
                <span className="text-sm font-medium">Your Own Key</span>
              </div>
              <p className="text-xs text-gray-500">Use your personal AI provider (recommended)</p>
            </button>
          </div>
        </div>

        {/* BYOK Section */}
        {aiConfig.mode === 'bring-your-own-key' && (
          <>
            {/* Provider Selection */}
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Choose Provider</h2>
              <div className="space-y-2">
                {PROVIDER_LIST.map((pKey) => {
                  const p = AI_PROVIDERS[pKey];
                  const isSelected = aiConfig.provider === pKey;
                  return (
                    <button
                      key={pKey}
                      onClick={() => handleProviderSelect(pKey)}
                      className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-rose-400 bg-rose-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl">{p.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{p.name}</span>
                          {isSelected && <Check className="w-4 h-4 text-rose-500" />}
                        </div>
                        <p className="text-xs text-gray-500">{p.instructions}</p>
                      </div>
                      {p.signupUrl && (
                        <a
                          href={p.signupUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-full hover:bg-gray-100"
                        >
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </a>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* API Key Input */}
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">API Key</h2>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={aiConfig.apiKey}
                  onChange={(e) => handleKeyChange(e.target.value)}
                  placeholder={`Enter your ${provider.name} API key`}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent pr-20"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>
              {provider.signupUrl && (
                <a
                  href={provider.signupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-xs text-rose-500 hover:text-rose-600"
                >
                  Get a free {provider.name} API key
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Model Selection */}
            {provider.models.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Model</h2>
                <div className="space-y-2">
                  {provider.models.map((model) => (
                    <button
                      key={model}
                      onClick={() => setAiModel(model)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border-2 transition-all text-left ${
                        aiConfig.model === model
                          ? 'border-rose-400 bg-rose-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm font-mono text-gray-700">{model}</span>
                      {aiConfig.model === model && <Check className="w-4 h-4 text-rose-500" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Test Connection */}
            <button
              onClick={testConnection}
              disabled={!aiConfig.apiKey || testStatus === 'testing'}
              className={`w-full py-3 rounded-2xl font-medium text-sm transition-all ${
                testStatus === 'success'
                  ? 'bg-green-500 text-white'
                  : testStatus === 'error'
                  ? 'bg-red-500 text-white'
                  : 'bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50'
              }`}
            >
              {testStatus === 'testing'
                ? 'Testing...'
                : testStatus === 'success'
               ? '✓ Connected!'
                : testStatus === 'error'
                ? '✗ Connection failed'
                : 'Test Connection'}
            </button>
          </>
        )}

        {/* Current Status */}
        <div className="p-4 bg-gray-50 rounded-2xl">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Current Setup</h3>
          <div className="space-y-1 text-sm text-gray-700">
            <p>Mode: <span className="font-medium">{aiConfig.mode === 'app-default' ? 'App Default' : 'Your Own Key'}</span></p>
            {aiConfig.mode === 'bring-your-own-key' && (
              <>
                <p>Provider: <span className="font-medium">{provider.name}</span></p>
                <p>Model: <span className="font-mono text-xs">{aiConfig.model}</span></p>
                <p>Key: <span className="font-medium">{aiConfig.apiKey ? '••••••••' + aiConfig.apiKey.slice(-4) : 'Not set'}</span></p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
