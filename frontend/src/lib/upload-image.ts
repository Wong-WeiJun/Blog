import { API_BASE_URL } from "./constants";

type UploadProgress = (percent: number) => void;

function uploadFile(
  path: string,
  file: File,
  onProgress?: UploadProgress,
): Promise<{ public_url: string; key: string }> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as { public_url: string; key: string });
        } catch {
          reject(new Error("Invalid upload response"));
        }
        return;
      }

      try {
        const err = JSON.parse(xhr.responseText) as { detail?: string };
        reject(new Error(err.detail ?? `Upload failed: ${xhr.status}`));
      } catch {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));

    xhr.open("POST", `${API_BASE_URL}${path}`);
    const token = localStorage.getItem("access_token");
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.send(formData);
  });
}

export function uploadAvatarImage(file: File, onProgress?: UploadProgress): Promise<string> {
  return uploadFile("/api/v1/uploads/avatar", file, onProgress).then((res) => res.public_url);
}

export function uploadCoverImage(file: File, onProgress?: UploadProgress): Promise<string> {
  return uploadFile("/api/v1/uploads/cover-image", file, onProgress).then((res) => res.public_url);
}
