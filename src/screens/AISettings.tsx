import { useState } from 'react';
import { ArrowLeft, Check, ExternalLink, Shield, Zap, Settings, RefreshCw } from 'lucide-react';
import { useGlowFitStore } from '../lib/store';
import { AI_PROVIDERS, detectProvider, fetchProviderModels, type ProviderKey } from '../lib/provider-config';

const PROVIDER_LIST: ProviderKey[] = ['gemini', 'nvidia', 'kilo', 'custom'];

export default function AISettingsScreen({ onBack }: { onBack: () => void }) {
  const { aiConfig, setAiMode, setAiProvider, setAiApiKey, setAiModel } = useGlowFitStore();
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testDetail, setTestDetail] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [liveModels, setLiveModels] = useState<string[] | null>(null);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);

  const provider = AI_PROVIDERS[aiConfig.provider as ProviderKey] || AI_PROVIDERS.gemini;
  const effectiveModels: string[] = liveModels ?? [...provider.models];

  const handleKeyChange = (key: string) => {
    setAiApiKey(key);
    if (key.trim() && aiConfig.mode !== 'bring-your-own-key') setAiMode('bring-your-own-key');
    const detected = detectProvider(key);
    if (detected) {
      const p = AI_PROVIDERS[detected];
      setAiProvider(detected, p.baseUrl, p.defaultModel);
    }
  };

  const handleProviderSelect = (pKey: ProviderKey) => {
    const p = AI_PROVIDERS[pKey];
    setAiProvider(pKey, p.baseUrl, p.defaultModel);
    // Picking a provider means the user wants to use it - don't make them
    // also find the mode switch.
    if (aiConfig.mode !== 'bring-your-own-key') setAiMode('bring-your-own-key');
  };

  const refreshModels = async () => {
    setModelsLoading(true);
    setModelsError(null);
    try {
      const models = await fetchProviderModels(aiConfig.baseUrl, aiConfig.apiKey);
      setLiveModels(models);
    } catch (err) {
      setLiveModels(null);
      setModelsError(err instanceof Error ? err.message : 'Could not load the model list.');
    } finally {
      setModelsLoading(false);
    }
  };

  const testConnection = async () => {
    if (!aiConfig.apiKey) return;
    setTestStatus('testing');
    setTestDetail(null);
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

      const raw = await response.text();
      let parsed: any = null;
      try {
        parsed = JSON.parse(raw);
      } catch {}

      if (response.ok && parsed?.choices?.[0]?.message?.content) {
        setTestStatus('success');
        setTestDetail(`"${aiConfig.model}" responded correctly.`);
      } else {
        setTestStatus('error');
        const reason =
          parsed?.error?.message ||
          (typeof parsed?.error === 'string' ? parsed.error : null) ||
          raw.slice(0, 200) ||
          `HTTP ${response.status}`;
        const looksLikeModelIssue = response.status === 404 || /model/i.test(String(reason));
        setTestDetail(
          looksLikeModelIssue
            ? `The provider rejected the model "${aiConfig.model}".\n\nProvider said: ${reason}\n\nTap "Refresh model list" and pick a model that exists today.`
            : `Provider said: ${reason}`
        );
      }
      setTimeout(() => setTestStatus('idle'), 8000);
    } catch (err) {
      setTestStatus('error');
      setTestDetail(
        err instanceof Error
          ? `Could not reach the provider: ${err.message}`
          : 'Could not reach the provider (network error).'
      );
      setTimeout(() => setTestStatus('idle'), 8000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-white">AI Coach Settings</h1>
            <p className="text-xs text-slate-400">Configure your personal AI Coach provider</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Privacy Notice */}
        <div className="flex items-start gap-3 p-4 bg-emerald-950/40 rounded-2xl border border-emerald-800/40">
          <Shield className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-emerald-300">Your key stays on your device</p>
            <p className="text-xs text-emerald-400/80 mt-1">
              API keys are stored locally in your browser/device and never sent to central servers. Direct provider connection.
            </p>
          </div>
        </div>

        {/* AI Mode Toggle */}
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-3">AI Mode</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setAiMode('app-default')}
              className={`p-4 rounded-2xl border-2 transition-all text-left ${
                aiConfig.mode === 'app-default'
                  ? 'border-purple-500 bg-purple-950/40'
                  : 'border-slate-800 bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium">App Default</span>
              </div>
              <p className="text-xs text-slate-400">Use built-in GlowFit AI coach</p>
            </button>
            <button
              onClick={() => setAiMode('bring-your-own-key')}
              className={`p-4 rounded-2xl border-2 transition-all text-left ${
                aiConfig.mode === 'bring-your-own-key'
                  ? 'border-purple-500 bg-purple-950/40'
                  : 'border-slate-800 bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium">Bring Your Own Key</span>
              </div>
              <p className="text-xs text-slate-400">Use your own AI provider (recommended)</p>
            </button>
          </div>
        </div>

        {/* BYOK Section - always visible so customers can find providers
            without first understanding the app-default vs BYOK distinction. */}
        {(
          <>
            {/* Provider Selection */}
            <div>
              <h2 className="text-sm font-semibold text-slate-300 mb-3">Choose Provider</h2>
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
                          ? 'border-purple-500 bg-purple-950/40'
                          : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-2xl">{p.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{p.name}</span>
                          {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                        </div>
                        <p className="text-xs text-slate-400">{p.instructions}</p>
                      </div>
                      {p.signupUrl && (
                        <a
                          href={p.signupUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-full hover:bg-slate-800"
                        >
                          <ExternalLink className="w-4 h-4 text-slate-400" />
                        </a>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* API Key Input */}
            <div>
              <h2 className="text-sm font-semibold text-slate-300 mb-3">API Key</h2>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={aiConfig.apiKey}
                  onChange={(e) => handleKeyChange(e.target.value)}
                  placeholder={`Enter your ${provider.name} API key`}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-500 pr-20"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>
              {provider.signupUrl && (
                <a
                  href={provider.signupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-xs text-purple-400 hover:text-purple-300"
                >
                  Get a free {provider.name} API key
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Model Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-300">Model</h2>
                <button
                  onClick={refreshModels}
                  disabled={!aiConfig.apiKey || modelsLoading}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-400 hover:text-purple-300 disabled:opacity-40"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${modelsLoading ? 'animate-spin' : ''}`} />
                  {modelsLoading ? 'Loading...' : 'Refresh model list'}
                </button>
              </div>

              {liveModels && (
                <p className="text-[11px] text-emerald-400 mb-2">
                  ✓ Live model list from {provider.name} ({liveModels.length} models found).
                </p>
              )}

              {modelsError && (
                <p className="text-[11px] text-red-400 mb-2 whitespace-pre-wrap">
                  Couldn't load live list: {modelsError}
                </p>
              )}

              {effectiveModels.length > 0 ? (
                <div className="space-y-2">
                  {effectiveModels.map((model) => (
                    <button
                      key={model}
                      onClick={() => setAiModel(model)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border-2 transition-all text-left ${
                        aiConfig.model === model
                          ? 'border-purple-500 bg-purple-950/40'
                          : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-sm font-mono text-slate-200">{model}</span>
                      {aiConfig.model === model && <Check className="w-4 h-4 text-purple-400" />}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  value={aiConfig.model}
                  onChange={(e) => setAiModel(e.target.value)}
                  placeholder="Type model id..."
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              )}
            </div>

            {/* Test Connection */}
            <button
              onClick={testConnection}
              disabled={!aiConfig.apiKey || testStatus === 'testing'}
              className={`w-full py-3 rounded-2xl font-medium text-sm transition-all ${
                testStatus === 'success'
                  ? 'bg-emerald-600 text-white'
                  : testStatus === 'error'
                  ? 'bg-red-600 text-white'
                  : 'bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50'
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

            {testDetail && (
              <div
                className={`p-3 rounded-2xl text-[11px] leading-relaxed whitespace-pre-wrap ${
                  testStatus === 'success'
                    ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/50'
                    : 'bg-red-950/50 text-red-300 border border-red-800/50'
                }`}
              >
                {testDetail}
              </div>
            )}
          </>
        )}

        {/* Current Status */}
        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Current Setup</h3>
          <div className="space-y-1 text-sm text-slate-300">
            <p>Mode: <span className="font-medium text-white">{aiConfig.mode === 'app-default' ? 'App Default' : 'Your Own Key'}</span></p>
            {aiConfig.mode === 'bring-your-own-key' && (
              <>
                <p>Provider: <span className="font-medium text-white">{provider.name}</span></p>
                <p>Model: <span className="font-mono text-xs text-purple-300">{aiConfig.model}</span></p>
                <p>Key: <span className="font-medium text-white">{aiConfig.apiKey ? '••••••••' + aiConfig.apiKey.slice(-4) : 'Not set'}</span></p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
