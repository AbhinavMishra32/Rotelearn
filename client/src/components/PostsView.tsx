import { Heart } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { api } from "../services/axios";
import { User } from "../types";
import CommentSection from "./CommentSection";
import { Separator } from "./ui/separator";
import { Link } from "react-router-dom";


export type Post = {
  title: string;
  content: string;
  likes: number;
  id: number;
};

type PostsViewProps = {
  posts: Post[];
  isLoading: boolean;
};

const FetchLikes: React.FC<{ post: Post; user: User }> = ({
  post,
  user,
}) => {
  const [count, setCount] = useState(post.likes);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoadingLike, setIsLoadingLike] = useState(false);
  // make liked state inside fetchlikes, and the button also put inside that component, make it handle everything

  useEffect(() => {
    const fetchIsLiked = async () => {
      try {
        const response = await api.get("/api/posts/like/isliked/" + post.id, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
        // console.log("isLiked response: ", response);
        setIsLiked(response.data.isLiked);
        setIsLoading(false);
      } catch (error) {
        console.log("Error in fetching isliked useEffect: ", error);
      }
    };
    fetchIsLiked();
  }, [post.id, user?.token]);

  const HandlelikeClick = async () => {
    if (isLoadingLike) return;

    setIsLoadingLike(true);
    try {
      setCount(isLiked ? count - 1 : count + 1);
      setIsLiked(!isLiked);
      const response = await api.post(
        "/api/posts/like/" + post.id,
        {},
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      console.log("like response: ", response);
      // setIsLiked(response.data.isLiked);
      // setCount(response.data.updatedPost.likes);
      setIsLoading(false);
    } catch (error) {
      console.log("Error in likes useEffect: ", error);
    } finally {
      setIsLoadingLike(false);
    }
  };

  return (
    <div>
      {isLoading ? (
        <Skeleton className="w-1/2 h-5 rounded-full" />
      ) : (
        <div className="flex items-center space-x-2">
          <button onClick={HandlelikeClick}>
            <div
              className={`flex justify-center items-center size-10 hover:bg-gray-200 hover:rounded-full active:size-11 transition-all ease-in-out`}
            >
              <Heart className="w-5 h-5" fill={isLiked ? "red" : "white"} />
            </div>
          </button>
          <span>{count}</span>
        </div>
      )}
    </div>
  );
};
const PostsView: React.FC<PostsViewProps> = ({ posts, isLoading }) => {
  const { user } = useUser();

  return (
    <div className="flex flex-col space-y-5">
      {isLoading
        ? Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-[125px] w-full rounded-xl" />
        ))
        : posts.map((post, index) => (
          <Card key={index} className="flex flex-col space-y-3 rounded-xl">
            <div className="hover:bg-gray-100 transition-colors border-b-2">
              <Link to={`/post/${post.id}`}>
                <CardTitle className="p-4">{post.title}</CardTitle>
                <CardContent className="">{post.content}</CardContent>
              </Link>
            </div>
            <CardFooter className="flex flex-col items-start gap-2">
              <FetchLikes post={post} user={user} />
              <Separator />
              <CommentSection postId={post.id} postTitle={post.title} />
            </CardFooter>
          </Card>
        ))
      }
    </div >
  );
};

export default PostsView;
