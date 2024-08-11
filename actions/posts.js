"use server";

import { redirect } from "next/navigation";
import { storePost, updatePostLikeStatus } from "@/lib/posts";
import { S3 } from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";

const s3 = new S3({
  region: "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

function uploadImage(image, title) {
  return new Promise((resolve, reject) => {
    if (!image || image.size === 0) {
      return reject(new Error("Image is required."));
    }

    const imageExtension = image.name.split(".").pop();
    const fileName = `${title}.${imageExtension}`;
    const bufferedImage = image.arrayBuffer();

    bufferedImage
      .then((buffer) => {
        s3.putObject(
          {
            Bucket: "alitarraf-nextjs-demo-posts-image",
            Key: fileName,
            Body: Buffer.from(buffer),
            ContentType: image.type,
          },
          (err, data) => {
            if (err) {
              return reject(err);
            }
            resolve(`/${fileName}`);
          }
        );
      })
      .catch((err) => reject(err));
  });
}

export async function CreatePost(prevState, formData) {
  const title = formData.get("title");
  const image = formData.get("image");
  const content = formData.get("content");

  let errors = [];

  if (!title || title.trim().length === 0) {
    errors.push("Title is required.");
  }
  if (!image || image.size === 0) {
    errors.push("Image is required.");
  }
  if (!content || content.trim().length === 0) {
    errors.push("Content is required.");
  }

  if (errors.length > 0) {
    return { errors };
  }

  let imageUrl;

  imageUrl = await uploadImage(image, title);

  storePost({
    imageUrl,
    title,
    content,
    userId: 1,
  });
  revalidatePath("/", "layout");
  redirect("/feed");
}

// export async function CreatePost(prevState, formData) {
//   const title = formData.get("title");
//   const image = formData.get("image");
//   const content = formData.get("content");

//   let errors = [];

//   if (!title || title.trim().length === 0) {
//     errors.push("Title is required.");
//   }
//   if (!image || image.size === 0) {
//     errors.push("Image is required.");
//   }
//   if (!content || content.trim().length === 0) {
//     errors.push("Content is required.");
//   }

//   if (errors.length > 0) {
//     return { errors };
//   }

//   const imageExtension = image.name.split(".").pop();
//   const fileName = `${title}.${imageExtension}`;
//   const bufferedImage = await meal.image.arrayBuffer();

//   s3.putObject({
//     Bucket: "alitarraf-nextjs-demo-posts-image",
//     Key: fileName,
//     Body: Buffer.from(bufferedImage),
//     ContentType: meal.image.type,
//   });

//   storePost({
//     imageUrl: `/${fileName}`,
//     title,
//     content,
//     userId: 1,
//   });

//   redirect("/feed");
// }

export const togglePostLikeStatus = async (postId) => {
  await updatePostLikeStatus(postId, 2);
  revalidatePath("/", "layout");
};
