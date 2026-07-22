import { v2 as cloudinary } from "cloudinary";

export const uploadWorkshopFile = (file) => {
  return new Promise((resolve, reject) => {
    const resourceType = file.mimetype.startsWith("video/") ? "video" : "image";

    const stream = cloudinary.uploader.upload_stream(
      {
        folder:
          resourceType === "video"
            ? "wopy/workshops/videos"
            : "wopy/workshops/images",
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
        });
      },
    );

    stream.end(file.buffer);
  });
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadWorkshopMediaFromBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const isVideo = file.mimetype.startsWith("video/");

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: isVideo ? "wopy/workshops/videos" : "wopy/workshops/images",

        resource_type: isVideo ? "video" : "image",

        ...(isVideo
          ? {}
          : {
              format: "webp",
              transformation: [
                {
                  width: 1600,
                  height: 1200,
                  crop: "limit",
                  quality: "auto",
                },
              ],
            }),
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
        });
      },
    );

    uploadStream.end(file.buffer);
  });
};

export const deleteWorkshopMedia = async (publicId, resourceType = "image") => {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
};
