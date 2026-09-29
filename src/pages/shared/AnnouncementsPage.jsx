import React, { useState } from 'react';
import { Megaphone, Plus, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AnnouncementsPage() {
  const { userRole, announcements = [], addAnnouncement, deleteAnnouncement } = useApp();
  const [isPosting, setIsPosting] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const now = new Date();
    const newAnnouncement = {
      id: `ann-${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      date: now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      author: 'Admin'
    };

    await addAnnouncement(newAnnouncement);
    setNewTitle('');
    setNewContent('');
    setIsPosting(false);
  };

  const handleDelete = async (id) => {
    await deleteAnnouncement(id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}>
      {/* Header section */}
      <div className="card" style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Megaphone style={{ color: 'var(--primary)' }} /> Live Announcements
            </h1>
            <p className="hide-on-mobile" style={{ color: 'var(--text-muted)', marginTop: '0.35rem', fontSize: '0.9rem' }}>
              Real-time updates, schedule changes, and notices from the administration.
            </p>
          </div>

          {userRole === 'Admin' && (
            <button 
              className="btn btn-primary" 
              onClick={() => setIsPosting(!isPosting)}
            >
              {isPosting ? 'Cancel' : <><Plus size={18} /> New Broadcast</>}
            </button>
          )}
        </div>

        {/* Post Form for Admin */}
        {userRole === 'Admin' && isPosting && (
          <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', background: 'var(--bg-input)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Announcement Title</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., Venue Change for Dance Competition"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Message Content</label>
              <textarea
                className="input-field"
                placeholder="Provide details here..."
                rows={4}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsPosting(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={!newTitle.trim() || !newContent.trim()}>
                <Megaphone size={16} /> Broadcast Now
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Announcements Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {announcements.length === 0 ? (
          <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={40} style={{ margin: '0 auto 1rem', color: '#cbd5e1' }} />
            <h3 style={{ margin: 0, color: 'var(--text-main)' }}>No Announcements Yet</h3>
            <p style={{ marginTop: '0.5rem' }}>You're all caught up! New updates will appear here.</p>
          </div>
        ) : (
          announcements.map((ann) => (
            <div key={ann.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Megaphone size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {ann.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      <Clock size={12} /> {ann.date} at {ann.time} • Posted by {ann.author}
                    </div>
                  </div>
                </div>
                
                {userRole === 'Admin' && (
                  <button 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => handleDelete(ann.id)}
                    style={{ padding: '0.4rem', color: '#ef4444', border: 'none', background: 'transparent' }}
                    title="Delete Announcement"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              
              <div style={{ paddingLeft: '3.25rem', color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.95rem' }}>
                {ann.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
