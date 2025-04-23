import { supabase } from '../../config/supabase';
import { ApiError } from '../../core/errors/ApiError';
import sharp from 'sharp';

// Nombre del bucket donde se guardarán las fotos de perfil
const PROFILE_BUCKET = 'profile-photos';

// Tipos MIME permitidos para fotos de perfil
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
];

// Configuración para la optimización de imágenes
const IMAGE_CONFIG = {
    format: 'webp' as const,  // Formato de salida: WebP
    quality: 80,              // Calidad (0-100)
    width: 500,               // Ancho máximo
    height: 500,              // Alto máximo
    fit: 'inside' as const,   // Mantener proporción sin recortar
    withoutEnlargement: true  // No ampliar imágenes pequeñas
};

// Tamaño máximo permitido para la carga (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Asegura que el bucket para fotos de perfil exista
 */
export const ensureProfileBucketExists = async () => {
    try {
        // Verificar si el bucket ya existe
        const { data: buckets, error: listError } = await supabase
            .storage
            .listBuckets();

        if (listError) throw new ApiError(500, 'Error al verificar buckets de almacenamiento', false, listError.message);

        // Si el bucket no existe, crearlo
        if (!buckets.find(b => b.name === PROFILE_BUCKET)) {
            const { error: createError } = await supabase
                .storage
                .createBucket(PROFILE_BUCKET, {
                    public: true, // Las fotos de perfil serán públicas
                    fileSizeLimit: MAX_FILE_SIZE,
                });

            if (createError) throw new ApiError(500, 'Error al crear bucket para fotos de perfil', false, createError.message);
        }
    } catch (error: any) {
        throw new ApiError(500, 'Error al configurar almacenamiento', false, error.message);
    }
};

/**
 * Optimiza una imagen usando sharp - reduce tamaño y convierte a WebP
 * @param imageBuffer Buffer de la imagen original
 * @returns Buffer de la imagen optimizada
 */
const optimizeImage = async (imageBuffer: Buffer): Promise<Buffer> => {
    try {
        // Obtener información de la imagen original
        const metadata = await sharp(imageBuffer).metadata();
        
        // Calcular dimensiones manteniendo la proporción
        let width = metadata.width || 0;
        let height = metadata.height || 0;
        
        if (width > IMAGE_CONFIG.width || height > IMAGE_CONFIG.height) {
            const aspectRatio = width / height;
            if (width > height) {
                width = Math.min(width, IMAGE_CONFIG.width);
                height = Math.round(width / aspectRatio);
            } else {
                height = Math.min(height, IMAGE_CONFIG.height);
                width = Math.round(height * aspectRatio);
            }
        }
        
        // Procesar la imagen: redimensionar y convertir a WebP
        return await sharp(imageBuffer)
            .resize({
                width,
                height,
                fit: IMAGE_CONFIG.fit,
                withoutEnlargement: IMAGE_CONFIG.withoutEnlargement
            })
            .webp({ quality: IMAGE_CONFIG.quality })
            .toBuffer();
    } catch (error: any) {
        // Si falla la optimización, devolver la imagen original
        return imageBuffer;
    }
};

/**
 * Obtiene la ruta completa de la foto de perfil de un usuario
 * @param userId ID del usuario
 */
const getProfilePhotoPath = (userId: string): string => {
    return `${userId}/profile.webp`;
};

/**
 * Sube una foto de perfil al storage y devuelve la URL pública
 * @param userId ID del usuario propietario del archivo
 * @param fileBuffer Buffer del archivo
 * @param fileType Tipo MIME del archivo
 */
export const uploadProfilePhoto = async (userId: string, fileBuffer: Buffer, fileType: string): Promise<string> => {
    try {
        // Validar tipo de archivo
        if (!ALLOWED_MIME_TYPES.includes(fileType)) {
            throw new ApiError(400, 'Formato de imagen no permitido. Use JPG, PNG o WebP', true);
        }

        // Validar tamaño de archivo original
        if (fileBuffer.length > MAX_FILE_SIZE) {
            throw new ApiError(400, 'El archivo excede el tamaño máximo permitido (5MB)', true);
        }

        await ensureProfileBucketExists();

        // Eliminar cualquier foto de perfil existente
        await deleteUserProfilePhoto(userId);

        // Optimizar la imagen (convertir a WebP y reducir tamaño)
        const optimizedBuffer = await optimizeImage(fileBuffer);
        
        // Usar una ruta consistente para la imagen
        const filePath = getProfilePhotoPath(userId);

        // Subir el archivo optimizado
        const { error: uploadError } = await supabase
            .storage
            .from(PROFILE_BUCKET)
            .upload(filePath, optimizedBuffer, {
                contentType: 'image/webp',
                upsert: true
            });

        if (uploadError) throw new ApiError(500, 'Error al subir foto de perfil', false, uploadError.message);

        // Obtener la URL pública con timestamp para evitar caché
        const { data: urlData } = supabase
            .storage
            .from(PROFILE_BUCKET)
            .getPublicUrl(`${filePath}?t=${Date.now()}`);

        if (!urlData || !urlData.publicUrl) {
            throw new ApiError(500, 'No se pudo obtener la URL pública de la imagen', false);
        }

        return urlData.publicUrl;
    } catch (error: any) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, 'Error al procesar la imagen', false, error.message);
    }
};

/**
 * Elimina la foto de perfil de un usuario
 * @param userId ID del usuario
 */
export const deleteUserProfilePhoto = async (userId: string): Promise<void> => {
    try {
        // Listar archivos en la carpeta del usuario
        const { data: fileList, error: listError } = await supabase
            .storage
            .from(PROFILE_BUCKET)
            .list(userId);

        if (listError || !fileList || fileList.length === 0) {
            return; // No hay archivos para eliminar o error al listar
        }

        const filePaths = fileList.map(file => `${userId}/${file.name}`);
        
        await supabase
            .storage
            .from(PROFILE_BUCKET)
            .remove(filePaths);
    } catch (error: any) {
        // Ignoramos errores al eliminar fotos antiguas para no interrumpir el flujo
    }
};

/**
 * Elimina una foto de perfil del storage a partir de su URL
 * @param fileUrl URL de la foto a eliminar
 */
export const deleteProfilePhoto = async (fileUrl: string): Promise<void> => {
    try {
        if (!fileUrl) return;

        // Extraer la ruta del archivo de la URL
        const urlObj = new URL(fileUrl);
        let pathname = urlObj.pathname;
        
        // Quitar parámetros de la URL si existen
        pathname = pathname.split('?')[0];
        
        const pathParts = pathname.split('/');
        const fileName = pathParts[pathParts.length - 1];
        const userId = pathParts[pathParts.length - 2];
        const filePath = `${userId}/${fileName}`;

        await supabase
            .storage
            .from(PROFILE_BUCKET)
            .remove([filePath]);
    } catch (error: any) {
        // Ignoramos errores al eliminar por URL para no interrumpir el flujo
    }
};

// Para compatibilidad con el código existente
export const removeOldUserPhotos = deleteUserProfilePhoto; 