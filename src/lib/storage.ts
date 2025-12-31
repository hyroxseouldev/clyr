import { createClient } from "@/lib/supabase/client";
import imageCompression from "browser-image-compression";

export async function uploadImage(file: File, bucket: string) {
  const supabase = createClient();

  // 1. 이미지 압축 설정 (MVP 센스: 1MB 이하, 가로세로 1024px 제한)
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1024,
    useWebWorker: true,
  };

  try {
    // 2. 클라이언트 사이드 압축
    const compressedFile = await imageCompression(file, options);

    // 3. 고유한 파일명 생성 (중복 및 한글 깨짐 방지)
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = fileName; // 폴더 구조가 필요하면 `${userId}/${fileName}` 식의 구성도 가능

    // 4. Supabase Storage 업로드
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, compressedFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    // 5. 최종 Public URL 가져오기
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return {
      publicUrl,
      storagePath: filePath, // 나중에 삭제할 때 이 값이 필요함
    };
  } catch (error) {
    console.error("STORAGE_UPLOAD_ERROR:", error);
    throw error;
  }
}
