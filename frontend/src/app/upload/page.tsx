"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
    type: "PDF",
    external_url: "",
    tags: ""
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      router.push("/login");
    } else {
      setToken(t);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = new FormData();
    data.append("title", formData.title);
    data.append("subject", formData.subject);
    data.append("description", formData.description);
    data.append("type", formData.type);
    
    // Process tags
    const tagArray = formData.tags.split(",").map(t => t.trim()).filter(t => t);
    data.append("tags", JSON.stringify(tagArray));

    if (formData.type === "LINK") {
      data.append("external_url", formData.external_url);
    } else if (file) {
      data.append("file", file);
    }

    try {
      const res = await fetch("http://localhost:3002/api/upload", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: data,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Upload failed");
      }

      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
      <div className={styles.uploadWrapper}>
        <h1 className={styles.title}>Submit a Resource</h1>
        <p className={styles.subtitle}>Help your fellow students by sharing notes, past papers, or helpful links.</p>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={styles.formGroup}>
            <label>Resource Title *</label>
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Intro to Machine Learning Final Notes"
            />
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>Subject / Course *</label>
              <input 
                type="text" 
                required
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
                placeholder="CS101"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Resource Type *</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option value="PDF">PDF Document</option>
                <option value="LINK">External Link</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Tags (Comma separated)</label>
            <input 
              type="text" 
              value={formData.tags}
              onChange={e => setFormData({...formData, tags: e.target.value})}
              placeholder="python, notes, final-exam"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea 
              rows={4}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Brief description of what this resource contains..."
            />
          </div>

          {formData.type === "LINK" ? (
            <div className={styles.formGroup}>
              <label>External URL *</label>
              <input 
                type="url" 
                required
                value={formData.external_url}
                onChange={e => setFormData({...formData, external_url: e.target.value})}
                placeholder="https://youtube.com/..."
              />
            </div>
          ) : (
            <div className={styles.formGroup}>
              <label>Upload PDF *</label>
              <div className={styles.fileUpload}>
                <input 
                  type="file" 
                  accept="application/pdf"
                  required
                  onChange={e => setFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Uploading..." : "Submit Resource"}
          </button>
        </form>
      </div>
    </div>
  );
}
