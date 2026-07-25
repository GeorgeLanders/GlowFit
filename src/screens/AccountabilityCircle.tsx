import { useState } from 'react';
import { useGlowFitStore } from '../lib/store';
import { ArrowLeft, Users, Plus, Link, Trophy } from 'lucide-react';

interface Circle {
  id: string;
  name: string;
  members: number;
  streak: number;
  inviteCode: string;
  isOwner: boolean;
}

export default function AccountabilityCircle() {
  const popScreen = useGlowFitStore((s) => s.popScreen);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [newName, setNewName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const createCircle = () => {
    if (newName.trim()) {
      setCircles(prev => [...prev, {
        id: Date.now().toString(),
        name: newName.trim(),
        members: 1,
        streak: 0,
        inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        isOwner: true,
      }]);
      setNewName('');
      setShowCreate(false);
    }
  };

  const joinCircle = () => {
    if (joinCode.trim()) {
      setCircles(prev => [...prev, {
        id: Date.now().toString(),
        name: 'Joined Circle',
        members: 4,
        streak: 7,
        inviteCode: joinCode.toUpperCase(),
        isOwner: false,
      }]);
      setJoinCode('');
      setShowJoin(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={popScreen} aria-label="Go back" className="p-2 rounded-xl bg-white/70 backdrop-blur-sm border border-white/40 shadow-[var(--shadow-card)]">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-500" />
          <h1 className="text-xl font-serif text-rose-900">Accountability Circles</h1>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl p-5 text-white shadow-lg text-center">
        <Users className="w-8 h-8 mx-auto mb-2" />
        <p className="text-lg font-semibold">Stay accountable together</p>
        <p className="text-sm text-white/80 mt-1">Create or join a circle to share your fitness journey with friends.</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button onClick={() => { setShowCreate(!showCreate); setShowJoin(false); }} aria-label="Create Circle"
          className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-violet-500 text-white font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg">
          <Plus className="w-5 h-5" /> Create Circle
        </button>
        <button onClick={() => { setShowJoin(!showJoin); setShowCreate(false); }} aria-label="Join Circle"
          className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg">
          <Link className="w-5 h-5" /> Join Circle
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)] space-y-3">
          <input type="text" placeholder="Circle name" value={newName} onChange={e => setNewName(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 text-slate-800" />
          <button onClick={createCircle} aria-label="Create circle" className="w-full py-3 rounded-xl bg-purple-500 text-white font-semibold active:scale-95 transition-all">Create</button>
        </div>
      )}

      {/* Join Form */}
      {showJoin && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)] space-y-3">
          <input type="text" placeholder="Enter invite code" value={joinCode} onChange={e => setJoinCode(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 text-slate-800 uppercase tracking-widest text-center text-lg font-mono" maxLength={6} />
          <button onClick={joinCircle} aria-label="Join circle" className="w-full py-3 rounded-xl bg-emerald-500 text-white font-semibold active:scale-95 transition-all">Join</button>
        </div>
      )}

      {/* Circles List */}
      <div className="space-y-3">
        {circles.map(circle => (
          <div key={circle.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg">
                {circle.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800">{circle.name}</h3>
                <p className="text-sm text-slate-500">{circle.members} members</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-amber-500">
                  <Trophy className="w-4 h-4" />
                  <span className="font-bold">{circle.streak}</span>
                </div>
                <p className="text-xs text-slate-400">day streak</p>
              </div>
            </div>
            {circle.isOwner && (
              <div className="mt-3 p-2 bg-slate-50 rounded-xl flex items-center gap-2">
                <Link className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-600 font-mono">{circle.inviteCode}</span>
                <button className="ml-auto text-xs text-purple-500 font-medium">Share</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {circles.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No circles yet. Create one or join a friend's!</p>
        </div>
      )}
    </div>
  );
}
