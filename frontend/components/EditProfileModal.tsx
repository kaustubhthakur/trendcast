"use client";
import { useState, useRef } from "react";
import styles from "./EditProfileModal.module.css";

interface Props {
  userId: number | string;
  current: { profile_pic: string; favorite_team: string };
  onClose: () => void;
  onSaved: (updated: any) => void;
}

export default function EditProfileModal({ userId, current, onClose, onSaved }: Props) {
  const [profilePic, setProfilePic]     = useState(current.profile_pic);
  const [favoriteTeam, setFavoriteTeam] = useState(current.favorite_team);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState("");
  const [imgError, setImgError]         = useState(false);
  const [tab, setTab]                   = useState<"url" | "upload">("upload");
  const fileRef                         = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (jpg, png, webp, gif).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB.");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      setProfilePic(reader.result as string);
      setImgError(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:8081/user/update/${userId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_pic: profilePic, favorite_team: favoriteTeam }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Update failed");
      }
      const updated = await res.json();
      onSaved(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const showPreview = profilePic && !imgError;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <p className={styles.titleEyebrow}>Your account</p>
            <h2 className={styles.title}>Edit Profile</h2>
          </div>
          <button className={styles.close} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Avatar preview */}
        {showPreview && (
          <div className={styles.avatarPreviewWrap}>
            <img
              src={profilePic}
              alt="Preview"
              className={styles.avatarPreviewImg}
              onError={() => setImgError(true)}
            />
            <div className={styles.avatarPreviewMeta}>
              <span className={styles.avatarPreviewLabel}>Preview</span>
              <button
                className={styles.avatarClear}
                onClick={() => { setProfilePic(""); setImgError(false); }}
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Tab switcher */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === "upload" ? styles.tabActive : ""}`}
            onClick={() => setTab("upload")}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Upload from device
          </button>
          <button
            className={`${styles.tab} ${tab === "url" ? styles.tabActive : ""}`}
            onClick={() => setTab("url")}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            Paste URL
          </button>
        </div>

        {/* Upload panel */}
        {tab === "upload" && (
          <div className={styles.formGroup}>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFile}
            />
            <div
              className={styles.dropZone}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add(styles.dropZoneActive ?? ""); }}
              onDragLeave={(e) => e.currentTarget.classList.remove(styles.dropZoneActive ?? "")}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  const fakeEvent = { target: { files: [file] } } as any;
                  handleFile(fakeEvent);
                }
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.dropIcon}>
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <p className={styles.dropText}>
                {profilePic && profilePic.startsWith("data:")
                  ? "Image selected — click to change"
                  : "Click to choose or drag & drop"}
              </p>
              <p className={styles.dropHint}>JPG, PNG, WEBP, GIF · max 5 MB</p>
            </div>
          </div>
        )}

        {/* URL panel */}
        {tab === "url" && (
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="profile-pic">Image URL</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              </span>
              <input
                id="profile-pic"
                className={styles.input}
                type="url"
                placeholder="https://example.com/your-photo.jpg"
                value={profilePic.startsWith("data:") ? "" : profilePic}
                onChange={(e) => { setProfilePic(e.target.value); setImgError(false); }}
              />
            </div>
            <p className={styles.hint}>Direct link to a jpg, png, or webp image</p>
          </div>
        )}

        {/* Favorite team */}
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="favorite-team">Favorite team</label>
          <div className={styles.inputWrap}>
            <span className={styles.inputIcon}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8l4 4-4 4-4-4 4-4z"/>
              </svg>
            </span>
            <input
              id="favorite-team"
              className={styles.input}
              type="text"
              placeholder="e.g. FC Barcelona, Real Madrid…"
              value={favoriteTeam}
              onChange={(e) => setFavoriteTeam(e.target.value)}
            />
          </div>
        </div>

        {error && <p className={styles.error}>⚠ {error}</p>}

        <div className={styles.divider} />

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={saving}>Cancel</button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Save changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}