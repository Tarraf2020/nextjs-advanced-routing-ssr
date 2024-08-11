import { CreatePost } from "@/actions/posts";
import PostForm from "@/components/post-form";

export default function NewPostPage() {
  return <PostForm action={CreatePost} />;
}
