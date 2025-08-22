import { create } from "zustand";
import { Post, Comment } from "../types";

interface PostStore {
  posts: Post[];
  selectedPost: Post | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setPosts: ( posts: Post[] ) => void;
  addPost: ( post: Post ) => void;
  updatePost: ( id: string, data: Partial<Post> ) => void;
  deletePost: ( id: string ) => void;
  likePost: ( id: string ) => void;
  unlikePost: ( id: string ) => void;
  bookmarkPost: ( id: string ) => void;
  unbookmarkPost: ( id: string ) => void;
  sharePost: ( id: string ) => void;
  upvotePost: ( id: string ) => void;
  downvotePost: ( id: string ) => void;
  removeVote: ( id: string ) => void;

  // Comment actions
  addComment: ( postId: string, comment: Comment ) => void;
  updateComment: ( postId: string, commentId: string, content: string ) => void;
  deleteComment: ( postId: string, commentId: string ) => void;
  likeComment: ( postId: string, commentId: string ) => void;
  unlikeComment: ( postId: string, commentId: string ) => void;

  setSelectedPost: ( post: Post | null ) => void;
  setLoading: ( loading: boolean ) => void;
  setError: ( error: string | null ) => void;
  clearError: () => void;
}

export const usePostStore = create<PostStore>( ( set ) => ( {
  posts: [],
  selectedPost: null,
  isLoading: false,
  error: null,

  setPosts: ( posts: Post[] ) => {
    set( { posts } );
  },

  addPost: ( post: Post ) => {
    set( ( state ) => ( {
      posts: [post, ...state.posts],
    } ) );
  },

  updatePost: ( id: string, data: Partial<Post> ) => {
    set( ( state ) => ( {
      posts: state.posts.map( ( post ) =>
        post.id === id
          ? { ...post, ...data, updatedAt: new Date().toISOString() }
          : post
      ),
      selectedPost:
        state.selectedPost?.id === id
          ? {
            ...state.selectedPost,
            ...data,
            updatedAt: new Date().toISOString(),
          }
          : state.selectedPost,
    } ) );
  },

  deletePost: ( id: string ) => {
    set( ( state ) => ( {
      posts: state.posts.filter( ( post ) => post.id !== id ),
      selectedPost: state.selectedPost?.id === id ? null : state.selectedPost,
    } ) );
  },

  likePost: ( id: string ) => {
    set( ( state ) => ( {
      posts: state.posts.map( ( post ) =>
        post.id === id
          ? {
            ...post,
            isLiked: true,
            _count: {
              ...post._count,
              likes: post._count.likes + 1,
            },
          }
          : post
      ),
      selectedPost:
        state.selectedPost?.id === id
          ? {
            ...state.selectedPost,
            isLiked: true,
            _count: {
              ...state.selectedPost._count,
              likes: state.selectedPost._count.likes + 1,
            },
          }
          : state.selectedPost,
    } ) );
  },

  unlikePost: ( id: string ) => {
    set( ( state ) => ( {
      posts: state.posts.map( ( post ) =>
        post.id === id
          ? {
            ...post,
            isLiked: false,
            _count: {
              ...post._count,
              likes: Math.max( 0, post._count.likes - 1 ),
            },
          }
          : post
      ),
      selectedPost:
        state.selectedPost?.id === id
          ? {
            ...state.selectedPost,
            isLiked: false,
            _count: {
              ...state.selectedPost._count,
              likes: Math.max( 0, state.selectedPost._count.likes - 1 ),
            },
          }
          : state.selectedPost,
    } ) );
  },

  bookmarkPost: ( id: string ) => {
    set( ( state ) => ( {
      posts: state.posts.map( ( post ) =>
        post.id === id
          ? {
            ...post,
            isBookmarked: true,
          }
          : post
      ),
      selectedPost:
        state.selectedPost?.id === id
          ? {
            ...state.selectedPost,
            isBookmarked: true,
          }
          : state.selectedPost,
    } ) );
  },

  unbookmarkPost: ( id: string ) => {
    set( ( state ) => ( {
      posts: state.posts.map( ( post ) =>
        post.id === id
          ? {
            ...post,
            isBookmarked: false,
          }
          : post
      ),
      selectedPost:
        state.selectedPost?.id === id
          ? {
            ...state.selectedPost,
            isBookmarked: false,
          }
          : state.selectedPost,
    } ) );
  },

  sharePost: ( id: string ) => {
    set( ( state ) => ( {
      posts: state.posts.map( ( post ) =>
        post.id === id
          ? {
            ...post,
            isShared: true,
            _count: {
              ...post._count,
              shares: post._count.shares + 1,
            },
          }
          : post
      ),
      selectedPost:
        state.selectedPost?.id === id
          ? {
            ...state.selectedPost,
            isShared: true,
            _count: {
              ...state.selectedPost._count,
              shares: state.selectedPost._count.shares + 1,
            },
          }
          : state.selectedPost,
    } ) );
  },

  // Comment actions
  addComment: ( postId: string, comment: Comment ) => {
    set( ( state ) => ( {
      posts: state.posts.map( ( post ) =>
        post.id === postId
          ? {
            ...post,
            comments: [comment, ...post.comments],
            _count: {
              ...post._count,
              comments: post._count.comments + 1,
            },
          }
          : post
      ),
      selectedPost:
        state.selectedPost?.id === postId
          ? {
            ...state.selectedPost,
            comments: [comment, ...state.selectedPost.comments],
            _count: {
              ...state.selectedPost._count,
              comments: state.selectedPost._count.comments + 1,
            },
          }
          : state.selectedPost,
    } ) );
  },

  updateComment: ( postId: string, commentId: string, content: string ) => {
    set( ( state ) => ( {
      posts: state.posts.map( ( post ) =>
        post.id === postId
          ? {
            ...post,
            comments: post.comments.map( ( comment ) =>
              comment.id === commentId
                ? { ...comment, content, updatedAt: new Date().toISOString() }
                : comment
            ),
          }
          : post
      ),
      selectedPost:
        state.selectedPost?.id === postId
          ? {
            ...state.selectedPost,
            comments: state.selectedPost.comments.map( ( comment ) =>
              comment.id === commentId
                ? { ...comment, content, updatedAt: new Date().toISOString() }
                : comment
            ),
          }
          : state.selectedPost,
    } ) );
  },

  deleteComment: ( postId: string, commentId: string ) => {
    set( ( state ) => ( {
      posts: state.posts.map( ( post ) =>
        post.id === postId
          ? {
            ...post,
            comments: post.comments.filter( ( comment ) => comment.id !== commentId ),
            _count: {
              ...post._count,
              comments: Math.max( 0, post._count.comments - 1 ),
            },
          }
          : post
      ),
      selectedPost:
        state.selectedPost?.id === postId
          ? {
            ...state.selectedPost,
            comments: state.selectedPost.comments.filter( ( comment ) => comment.id !== commentId ),
            _count: {
              ...state.selectedPost._count,
              comments: Math.max( 0, state.selectedPost._count.comments - 1 ),
            },
          }
          : state.selectedPost,
    } ) );
  },

  likeComment: ( postId: string, commentId: string ) => {
    set( ( state ) => ( {
      posts: state.posts.map( ( post ) =>
        post.id === postId
          ? {
            ...post,
            comments: post.comments.map( ( comment ) =>
              comment.id === commentId
                ? {
                  ...comment,
                  _count: {
                    ...comment._count,
                    likes: comment._count.likes + 1,
                  },
                }
                : comment
            ),
          }
          : post
      ),
      selectedPost:
        state.selectedPost?.id === postId
          ? {
            ...state.selectedPost,
            comments: state.selectedPost.comments.map( ( comment ) =>
              comment.id === commentId
                ? {
                  ...comment,
                  _count: {
                    ...comment._count,
                    likes: comment._count.likes + 1,
                  },
                }
                : comment
            ),
          }
          : state.selectedPost,
    } ) );
  },

  unlikeComment: ( postId: string, commentId: string ) => {
    set( ( state ) => ( {
      posts: state.posts.map( ( post ) =>
        post.id === postId
          ? {
            ...post,
            comments: post.comments.map( ( comment ) =>
              comment.id === commentId
                ? {
                  ...comment,
                  _count: {
                    ...comment._count,
                    likes: Math.max( 0, comment._count.likes - 1 ),
                  },
                }
                : comment
            ),
          }
          : post
      ),
      selectedPost:
        state.selectedPost?.id === postId
          ? {
            ...state.selectedPost,
            comments: state.selectedPost.comments.map( ( comment ) =>
              comment.id === commentId
                ? {
                  ...comment,
                  _count: {
                    ...comment._count,
                    likes: Math.max( 0, comment._count.likes - 1 ),
                  },
                }
                : comment
            ),
          }
          : state.selectedPost,
    } ) );
  },

  setSelectedPost: ( post: Post | null ) => {
    set( { selectedPost: post } );
  },

  setLoading: ( loading: boolean ) => {
    set( { isLoading: loading } );
  },

  setError: ( error: string | null ) => {
    set( { error } );
  },

  clearError: () => {
    set( { error: null } );
  },

  upvotePost: ( id: string ) => {
    set( ( state ) => ( {
      posts: state.posts.map( ( post ) =>
        post.id === id
          ? {
            ...post,
            isUpvoted: true,
            isDownvoted: false,
            _count: {
              ...post._count,
              upvotes: post._count.upvotes + 1,
              downvotes: post.isDownvoted ? Math.max( 0, post._count.downvotes - 1 ) : post._count.downvotes,
            },
          }
          : post
      ),
      selectedPost:
        state.selectedPost?.id === id
          ? {
            ...state.selectedPost,
            isUpvoted: true,
            isDownvoted: false,
            _count: {
              ...state.selectedPost._count,
              upvotes: state.selectedPost._count.upvotes + 1,
              downvotes: state.selectedPost.isDownvoted ? Math.max( 0, state.selectedPost._count.downvotes - 1 ) : state.selectedPost._count.downvotes,
            },
          }
          : state.selectedPost,
    } ) );
  },

  downvotePost: ( id: string ) => {
    set( ( state ) => ( {
      posts: state.posts.map( ( post ) =>
        post.id === id
          ? {
            ...post,
            isDownvoted: true,
            isUpvoted: false,
            _count: {
              ...post._count,
              downvotes: post._count.downvotes + 1,
              upvotes: post.isUpvoted ? Math.max( 0, post._count.upvotes - 1 ) : post._count.upvotes,
            },
          }
          : post
      ),
      selectedPost:
        state.selectedPost?.id === id
          ? {
            ...state.selectedPost,
            isDownvoted: true,
            isUpvoted: false,
            _count: {
              ...state.selectedPost._count,
              downvotes: state.selectedPost._count.downvotes + 1,
              upvotes: state.selectedPost.isUpvoted ? Math.max( 0, state.selectedPost._count.upvotes - 1 ) : state.selectedPost._count.upvotes,
            },
          }
          : state.selectedPost,
    } ) );
  },

  removeVote: ( id: string ) => {
    set( ( state ) => ( {
      posts: state.posts.map( ( post ) =>
        post.id === id
          ? {
            ...post,
            isUpvoted: false,
            isDownvoted: false,
            _count: {
              ...post._count,
              upvotes: post.isUpvoted ? Math.max( 0, post._count.upvotes - 1 ) : post._count.upvotes,
              downvotes: post.isDownvoted ? Math.max( 0, post._count.downvotes - 1 ) : post._count.downvotes,
            },
          }
          : post
      ),
      selectedPost:
        state.selectedPost?.id === id
          ? {
            ...state.selectedPost,
            isUpvoted: false,
            isDownvoted: false,
            _count: {
              ...state.selectedPost._count,
              upvotes: state.selectedPost.isUpvoted ? Math.max( 0, state.selectedPost._count.upvotes - 1 ) : state.selectedPost._count.upvotes,
              downvotes: state.selectedPost.isDownvoted ? Math.max( 0, state.selectedPost._count.downvotes - 1 ) : state.selectedPost._count.downvotes,
            },
          }
          : state.selectedPost,
    } ) );
  },
} ) );
