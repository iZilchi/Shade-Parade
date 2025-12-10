import React, { useState } from 'react';

const UserProfile = ({ user, onLogout, onClose }) => {
  const [activeTab, setActiveTab] = useState('profile');

  const getUserInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="profile-modal">
      <div className="profile-content">
        <div className="profile-header">
          <button 
            onClick={onClose}
            className="profile-close"
          >
            &times;
          </button>
          <h2 className="profile-title">My Account</h2>
        </div>
        
        <div className="profile-info">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {getUserInitials(user.name)}
            </div>
          </div>
          
          <div className="profile-details">
            <h3 className="profile-name">{user.name}</h3>
            <p className="profile-email">{user.email}</p>
            <p className="profile-member">Member since {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="profile-tabs">
          <button 
            className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button 
            className={`profile-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
          <button 
            className={`profile-tab ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            Preferences
          </button>
        </div>
        
        <div className="profile-body">
          {activeTab === 'profile' && (
            <div className="profile-section">
              <h4>Account Information</h4>
              <div className="info-grid">
                <div className="info-item">
                  <label>Full Name</label>
                  <p>{user.name}</p>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <p>{user.email}</p>
                </div>
                <div className="info-item">
                  <label>Account Type</label>
                  <p className="badge badge-success">Free Plan</p>
                </div>
                <div className="info-item">
                  <label>Palettes Saved</label>
                  <p className="text-xl font-bold text-primary">12</p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="profile-section">
              <h4>Application Settings</h4>
              <div className="settings-list">
                <div className="setting-item">
                  <div>
                    <h5>Dark Mode</h5>
                    <p>Switch to dark theme</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <div>
                    <h5>Auto-save</h5>
                    <p>Automatically save changes</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <div>
                    <h5>Color Format</h5>
                    <p>Display colors as HEX</p>
                  </div>
                  <span className="text-sm text-gray-600">HEX</span>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'preferences' && (
            <div className="profile-section">
              <h4>Color Preferences</h4>
              <div className="preferences-list">
                <div className="preference-item">
                  <label>Default Color Palette</label>
                  <select className="form-input">
                    <option>Basic</option>
                    <option>Pastel</option>
                    <option>Neon</option>
                    <option>Monochrome</option>
                  </select>
                </div>
                <div className="preference-item">
                  <label>Default Sorting Algorithm</label>
                  <select className="form-input">
                    <option>Merge Sort</option>
                    <option>Quick Sort</option>
                    <option>Bubble Sort</option>
                  </select>
                </div>
                <div className="preference-item">
                  <label>AI Model Preference</label>
                  <select className="form-input">
                    <option>Color API</option>
                    <option>HueTools</option>
                    <option>Colormind</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="profile-footer">
          <button 
            onClick={onLogout}
            className="btn btn-danger w-full"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;