"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import EditProfileModal from "../../components/EditProfileModal";
import styles from "./Profile.module.css";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading]         = useState(true);
  const [modalOpen, setModalOpen]     = useState(false);
  const [error, setError]             = useState("");

  useEffect(() => {
    if (!user?.id) return;
    fetch(`http://localhost:8081/user/${user.id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setProfileData(data))
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, [user]);

  const handleSaved = (updated: any) => {
    setProfileData((prev: any) => ({ ...prev, ...updated }));
    if (setUser) setUser((prev: any) => ({ ...prev, ...updated }));
  };

  if (loading) return <div className={styles.loading}>Loading…</div>;
  if (error)   return <div className={styles.error}>{error}</div>;

  const displayName = profileData?.username || profileData?.email?.split("@")[0] || "User";
  const initials    = displayName.slice(0, 2).toUpperCase();

  const joinedDate = profileData?.created_at
    ? new Date(profileData.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "—";

  return (
    <main className={styles.page}>
      <div className={styles.card}>

        {/* Top: avatar + name */}
        <div className={styles.top}>
          <div className={styles.avatar}>
            {profileData?.profile_pic ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profileData.profile_pic} alt={displayName} className={styles.avatarImg} />
            ) : (
              initials
            )}
          </div>
          <div className={styles.nameBlock}>
            <h1 className={styles.username}>{displayName}</h1>
            <p className={styles.email}>{profileData?.email}</p>
          </div>
        </div>

        {/* Field rows */}
        <div className={styles.fields}>

          <div className={styles.row}>
            <span className={styles.rowLabel}>Member since</span>
            <span className={styles.rowVal}>{joinedDate}</span>
          </div>

          <div className={styles.row}>
            <span className={styles.rowLabel}>Favorite team</span>
            {profileData?.favorite_team
              ? <span className={styles.rowValSet}>{profileData.favorite_team}</span>
              : <span className={styles.rowVal}>Not set</span>
            }
          </div>

          <div className={styles.row}>
            <span className={styles.rowLabel}>Profile picture</span>
            {profileData?.profile_pic
              ? <span className={`${styles.badge} ${styles.badgeSet}`}>● Custom</span>
              : <span className={styles.badge}>Default</span>
            }
          </div>

        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.editBtn} onClick={() => setModalOpen(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit profile
          </button>
        </div>
      </div>

      {modalOpen && (
        <EditProfileModal
          userId={user?.id}
          current={{
            profile_pic: profileData?.profile_pic || "",
            favorite_team: profileData?.favorite_team || "",
          }}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </main>
  );
}