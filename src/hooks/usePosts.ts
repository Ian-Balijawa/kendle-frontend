import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService, CreatePostRequest, GetPostsParams, UpdatePostRequest, VoteRequest, ShareRequest, BookmarkRequest } from '../services/api';
import { Post, PostsResponse } from '../types';
import { useAuthStore } from '../stores/authStore';

// Query keys
export const postKeys = {
    all: ['posts'] as const,
    lists: () => [...postKeys.all, 'list'] as const,
    list: ( params: GetPostsParams ) => [...postKeys.lists(), params] as const,
    details: () => [...postKeys.all, 'detail'] as const,
    detail: ( id: string ) => [...postKeys.details(), id] as const,
    user: ( userId: string ) => [...postKeys.all, 'user', userId] as const,
    liked: () => [...postKeys.all, 'liked'] as const,
    bookmarked: () => [...postKeys.all, 'bookmarked'] as const,
    me: () => [...postKeys.all, 'me'] as const,
};

// Get posts with infinite scroll
export function useInfinitePosts( params: GetPostsParams = {} ) {
    return useInfiniteQuery( {
        queryKey: postKeys.list( params ),
        queryFn: ( { pageParam = 1 } ) =>
            apiService.getPosts( { ...params, page: pageParam } ),
        getNextPageParam: ( lastPage: PostsResponse ) => {
            if ( lastPage.pagination.page < lastPage.pagination.totalPages ) {
                return lastPage.pagination.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
    } );
}

// Get single post
export function usePost( id: string ) {
    return useQuery( {
        queryKey: postKeys.detail( id ),
        queryFn: () => apiService.getPost( id ),
        staleTime: 5 * 60 * 1000,
    } );
}

// Get user posts
export function useUserPosts( userId: string, params: { page?: number; limit?: number } = {} ) {
    return useInfiniteQuery( {
        queryKey: [...postKeys.user( userId ), params],
        queryFn: ( { pageParam = 1 } ) =>
            apiService.getUserPosts( userId, { ...params, page: pageParam } ),
        getNextPageParam: ( lastPage: PostsResponse ) => {
            if ( lastPage.pagination.page < lastPage.pagination.totalPages ) {
                return lastPage.pagination.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
    } );
}

// Get liked posts
export function useLikedPosts( params: { page?: number; limit?: number } = {} ) {
    return useInfiniteQuery( {
        queryKey: [...postKeys.liked(), params],
        queryFn: ( { pageParam = 1 } ) =>
            apiService.getLikedPosts( { ...params, page: pageParam } ),
        getNextPageParam: ( lastPage: PostsResponse ) => {
            if ( lastPage.pagination.page < lastPage.pagination.totalPages ) {
                return lastPage.pagination.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
    } );
}

// Get bookmarked posts
export function useBookmarkedPosts( params: { page?: number; limit?: number } = {} ) {
    return useInfiniteQuery( {
        queryKey: [...postKeys.bookmarked(), params],
        queryFn: ( { pageParam = 1 } ) =>
            apiService.getBookmarkedPosts( { ...params, page: pageParam } ),
        getNextPageParam: ( lastPage: PostsResponse ) => {
            if ( lastPage.pagination.page < lastPage.pagination.totalPages ) {
                return lastPage.pagination.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
    } );
}

// Get my posts
export function useMyPosts( params: { page?: number; limit?: number } = {} ) {
    return useInfiniteQuery( {
        queryKey: [...postKeys.me(), params],
        queryFn: ( { pageParam = 1 } ) =>
            apiService.getMyPosts( { ...params, page: pageParam } ),
        getNextPageParam: ( lastPage: PostsResponse ) => {
            if ( lastPage.pagination.page < lastPage.pagination.totalPages ) {
                return lastPage.pagination.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
    } );
}

// Create post mutation
export function useCreatePost() {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    return useMutation( {
        mutationFn: ( data: CreatePostRequest ) => apiService.createPost( data ),
        onMutate: async ( newPost ) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries( { queryKey: postKeys.lists() } );

            // Create optimistic post
            const optimisticPost: Post = {
                id: `temp-${Date.now()}`,
                content: newPost.content,
                author: user!,
                media: newPost.media?.map( ( m, index ) => ( {
                    id: `temp-media-${index}`,
                    url: m.url,
                    type: m.type,
                    filename: `temp-${index}`,
                    size: m.fileSize || 0,
                    createdAt: new Date().toISOString(),
                } ) ) || [],
                hashtags: newPost.tags?.map( t => t.name ) || [],
                likes: [],
                comments: [],
                shares: [],
                upvotes: [],
                downvotes: [],
                isLiked: false,
                isShared: false,
                isBookmarked: false,
                isUpvoted: false,
                isDownvoted: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                _count: {
                    likes: 0,
                    comments: 0,
                    shares: 0,
                    upvotes: 0,
                    downvotes: 0,
                },
            };

            // Optimistically update the cache
            queryClient.setQueriesData(
                { queryKey: postKeys.lists() },
                ( old: any ) => {
                    if ( !old ) return old;

                    return {
                        ...old,
                        pages: old.pages.map( ( page: PostsResponse, index: number ) => {
                            if ( index === 0 ) {
                                return {
                                    ...page,
                                    data: [optimisticPost, ...page.data],
                                    pagination: {
                                        ...page.pagination,
                                        total: page.pagination.total + 1,
                                    },
                                };
                            }
                            return page;
                        } ),
                    };
                }
            );

            return { optimisticPost };
        },
        onError: ( _, __, context ) => {
            // Revert the optimistic update
            if ( context?.optimisticPost ) {
                queryClient.setQueriesData(
                    { queryKey: postKeys.lists() },
                    ( old: any ) => {
                        if ( !old ) return old;

                        return {
                            ...old,
                            pages: old.pages.map( ( page: PostsResponse, index: number ) => {
                                if ( index === 0 ) {
                                    return {
                                        ...page,
                                        data: page.data.filter( ( post: Post ) => post.id !== context.optimisticPost.id ),
                                        pagination: {
                                            ...page.pagination,
                                            total: Math.max( 0, page.pagination.total - 1 ),
                                        },
                                    };
                                }
                                return page;
                            } ),
                        };
                    }
                );
            }
        },
        onSuccess: ( newPost, _, context ) => {
            // Replace the optimistic post with the real one
            if ( context?.optimisticPost ) {
                queryClient.setQueriesData(
                    { queryKey: postKeys.lists() },
                    ( old: any ) => {
                        if ( !old ) return old;

                        return {
                            ...old,
                            pages: old.pages.map( ( page: PostsResponse, index: number ) => {
                                if ( index === 0 ) {
                                    return {
                                        ...page,
                                        data: page.data.map( ( post: Post ) =>
                                            post.id === context.optimisticPost.id ? newPost : post
                                        ),
                                    };
                                }
                                return page;
                            } ),
                        };
                    }
                );
            }

            // Invalidate and refetch
            queryClient.invalidateQueries( { queryKey: postKeys.lists() } );
            queryClient.invalidateQueries( { queryKey: postKeys.me() } );
        },
    } );
}

// Update post mutation
export function useUpdatePost() {
    const queryClient = useQueryClient();

    return useMutation( {
        mutationFn: ( { id, data }: { id: string; data: UpdatePostRequest } ) =>
            apiService.updatePost( id, data ),
        onMutate: async ( { id, data } ) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries( { queryKey: postKeys.detail( id ) } );
            await queryClient.cancelQueries( { queryKey: postKeys.lists() } );

            // Snapshot the previous value
            const previousPost = queryClient.getQueryData( postKeys.detail( id ) );

            // Optimistically update the single post
            queryClient.setQueryData( postKeys.detail( id ), ( old: Post | undefined ) => {
                if ( !old ) return old;
                return {
                    ...old,
                    ...data,
                    updatedAt: new Date().toISOString(),
                };
            } );

            // Optimistically update in lists
            queryClient.setQueriesData(
                { queryKey: postKeys.lists() },
                ( old: any ) => {
                    if ( !old ) return old;

                    return {
                        ...old,
                        pages: old.pages.map( ( page: PostsResponse ) => ( {
                            ...page,
                            data: page.data.map( ( post: Post ) =>
                                post.id === id
                                    ? { ...post, ...data, updatedAt: new Date().toISOString() }
                                    : post
                            ),
                        } ) ),
                    };
                }
            );

            return { previousPost };
        },
        onError: ( _, { id }, context ) => {
            // Revert the optimistic updates
            if ( context?.previousPost ) {
                queryClient.setQueryData( postKeys.detail( id ), context.previousPost );
            }
            queryClient.invalidateQueries( { queryKey: postKeys.lists() } );
        },
        onSuccess: ( updatedPost, { id } ) => {
            // Update the cache with the server response
            queryClient.setQueryData( postKeys.detail( id ), updatedPost );
            queryClient.invalidateQueries( { queryKey: postKeys.lists() } );
        },
    } );
}

// Delete post mutation
export function useDeletePost() {
    const queryClient = useQueryClient();

    return useMutation( {
        mutationFn: ( id: string ) => apiService.deletePost( id ),
        onMutate: async ( id ) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries( { queryKey: postKeys.lists() } );

            // Snapshot the previous value
            const previousData = queryClient.getQueriesData( { queryKey: postKeys.lists() } );

            // Optimistically remove the post from all lists
            queryClient.setQueriesData(
                { queryKey: postKeys.lists() },
                ( old: any ) => {
                    if ( !old ) return old;

                    return {
                        ...old,
                        pages: old.pages.map( ( page: PostsResponse ) => ( {
                            ...page,
                            data: page.data.filter( ( post: Post ) => post.id !== id ),
                            pagination: {
                                ...page.pagination,
                                total: Math.max( 0, page.pagination.total - 1 ),
                            },
                        } ) ),
                    };
                }
            );

            return { previousData };
        },
        onError: ( _, __, context ) => {
            // Revert the optimistic updates
            if ( context?.previousData ) {
                context.previousData.forEach( ( [queryKey, data] ) => {
                    queryClient.setQueryData( queryKey, data );
                } );
            }
        },
        onSuccess: ( _, id ) => {
            // Remove the post detail from cache
            queryClient.removeQueries( { queryKey: postKeys.detail( id ) } );
            queryClient.invalidateQueries( { queryKey: postKeys.lists() } );
        },
    } );
}

// Like post mutation
export function useLikePost() {
    const queryClient = useQueryClient();

    return useMutation( {
        mutationFn: ( id: string ) => apiService.likePost( id ),
        onMutate: async ( id ) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries( { queryKey: postKeys.detail( id ) } );
            await queryClient.cancelQueries( { queryKey: postKeys.lists() } );

            // Optimistically update
            const updatePost = ( post: Post ) => ( {
                ...post,
                isLiked: true,
                _count: {
                    ...post._count,
                    likes: post._count.likes + 1,
                },
            } );

            // Update single post
            queryClient.setQueryData( postKeys.detail( id ), ( old: Post | undefined ) => {
                if ( !old ) return old;
                return updatePost( old );
            } );

            // Update in lists
            queryClient.setQueriesData(
                { queryKey: postKeys.lists() },
                ( old: any ) => {
                    if ( !old ) return old;

                    return {
                        ...old,
                        pages: old.pages.map( ( page: PostsResponse ) => ( {
                            ...page,
                            data: page.data.map( ( post: Post ) =>
                                post.id === id ? updatePost( post ) : post
                            ),
                        } ) ),
                    };
                }
            );
        },
        onError: ( _, id ) => {
            // Revert the optimistic updates
            queryClient.invalidateQueries( { queryKey: postKeys.detail( id ) } );
            queryClient.invalidateQueries( { queryKey: postKeys.lists() } );
        },
    } );
}

// Unlike post mutation
export function useUnlikePost() {
    const queryClient = useQueryClient();

    return useMutation( {
        mutationFn: ( id: string ) => apiService.unlikePost( id ),
        onMutate: async ( id ) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries( { queryKey: postKeys.detail( id ) } );
            await queryClient.cancelQueries( { queryKey: postKeys.lists() } );

            // Optimistically update
            const updatePost = ( post: Post ) => ( {
                ...post,
                isLiked: false,
                _count: {
                    ...post._count,
                    likes: Math.max( 0, post._count.likes - 1 ),
                },
            } );

            // Update single post
            queryClient.setQueryData( postKeys.detail( id ), ( old: Post | undefined ) => {
                if ( !old ) return old;
                return updatePost( old );
            } );

            // Update in lists
            queryClient.setQueriesData(
                { queryKey: postKeys.lists() },
                ( old: any ) => {
                    if ( !old ) return old;

                    return {
                        ...old,
                        pages: old.pages.map( ( page: PostsResponse ) => ( {
                            ...page,
                            data: page.data.map( ( post: Post ) =>
                                post.id === id ? updatePost( post ) : post
                            ),
                        } ) ),
                    };
                }
            );
        },
        onError: ( _, id ) => {
            // Revert the optimistic updates
            queryClient.invalidateQueries( { queryKey: postKeys.detail( id ) } );
            queryClient.invalidateQueries( { queryKey: postKeys.lists() } );
        },
    } );
}

// Bookmark post mutation
export function useBookmarkPost() {
    const queryClient = useQueryClient();

    return useMutation( {
        mutationFn: ( { id, data }: { id: string; data?: BookmarkRequest } ) =>
            apiService.bookmarkPost( id, data ),
        onMutate: async ( { id } ) => {
            // Optimistically update
            const updatePost = ( post: Post ) => ( {
                ...post,
                isBookmarked: true,
            } );

            // Update single post
            queryClient.setQueryData( postKeys.detail( id ), ( old: Post | undefined ) => {
                if ( !old ) return old;
                return updatePost( old );
            } );

            // Update in lists
            queryClient.setQueriesData(
                { queryKey: postKeys.lists() },
                ( old: any ) => {
                    if ( !old ) return old;

                    return {
                        ...old,
                        pages: old.pages.map( ( page: PostsResponse ) => ( {
                            ...page,
                            data: page.data.map( ( post: Post ) =>
                                post.id === id ? updatePost( post ) : post
                            ),
                        } ) ),
                    };
                }
            );
        },
        onError: ( _, { id } ) => {
            queryClient.invalidateQueries( { queryKey: postKeys.detail( id ) } );
            queryClient.invalidateQueries( { queryKey: postKeys.lists() } );
        },
        onSuccess: () => {
            queryClient.invalidateQueries( { queryKey: postKeys.bookmarked() } );
        },
    } );
}

// Unbookmark post mutation
export function useUnbookmarkPost() {
    const queryClient = useQueryClient();

    return useMutation( {
        mutationFn: ( id: string ) => apiService.unbookmarkPost( id ),
        onMutate: async ( id ) => {
            // Optimistically update
            const updatePost = ( post: Post ) => ( {
                ...post,
                isBookmarked: false,
            } );

            // Update single post
            queryClient.setQueryData( postKeys.detail( id ), ( old: Post | undefined ) => {
                if ( !old ) return old;
                return updatePost( old );
            } );

            // Update in lists
            queryClient.setQueriesData(
                { queryKey: postKeys.lists() },
                ( old: any ) => {
                    if ( !old ) return old;

                    return {
                        ...old,
                        pages: old.pages.map( ( page: PostsResponse ) => ( {
                            ...page,
                            data: page.data.map( ( post: Post ) =>
                                post.id === id ? updatePost( post ) : post
                            ),
                        } ) ),
                    };
                }
            );
        },
        onError: ( _, id ) => {
            queryClient.invalidateQueries( { queryKey: postKeys.detail( id ) } );
            queryClient.invalidateQueries( { queryKey: postKeys.lists() } );
        },
        onSuccess: () => {
            queryClient.invalidateQueries( { queryKey: postKeys.bookmarked() } );
        },
    } );
}

// Vote post mutation
export function useVotePost() {
    const queryClient = useQueryClient();

    return useMutation( {
        mutationFn: ( { id, data }: { id: string; data: VoteRequest } ) =>
            apiService.votePost( id, data ),
        onMutate: async ( { id, data } ) => {
            // Optimistically update
            const updatePost = ( post: Post ) => {
                const isUpvote = data.voteType === 'upvote';
                const wasUpvoted = post.isUpvoted;
                const wasDownvoted = post.isDownvoted;

                let upvotes = post._count.upvotes;
                let downvotes = post._count.downvotes;

                if ( isUpvote ) {
                    if ( wasUpvoted ) {
                        // Remove upvote
                        upvotes = Math.max( 0, upvotes - 1 );
                    } else {
                        // Add upvote
                        upvotes = upvotes + 1;
                        if ( wasDownvoted ) {
                            // Remove previous downvote
                            downvotes = Math.max( 0, downvotes - 1 );
                        }
                    }
                } else {
                    if ( wasDownvoted ) {
                        // Remove downvote
                        downvotes = Math.max( 0, downvotes - 1 );
                    } else {
                        // Add downvote
                        downvotes = downvotes + 1;
                        if ( wasUpvoted ) {
                            // Remove previous upvote
                            upvotes = Math.max( 0, upvotes - 1 );
                        }
                    }
                }

                return {
                    ...post,
                    isUpvoted: isUpvote ? !wasUpvoted : false,
                    isDownvoted: !isUpvote ? !wasDownvoted : false,
                    _count: {
                        ...post._count,
                        upvotes,
                        downvotes,
                    },
                };
            };

            // Update single post
            queryClient.setQueryData( postKeys.detail( id ), ( old: Post | undefined ) => {
                if ( !old ) return old;
                return updatePost( old );
            } );

            // Update in lists
            queryClient.setQueriesData(
                { queryKey: postKeys.lists() },
                ( old: any ) => {
                    if ( !old ) return old;

                    return {
                        ...old,
                        pages: old.pages.map( ( page: PostsResponse ) => ( {
                            ...page,
                            data: page.data.map( ( post: Post ) =>
                                post.id === id ? updatePost( post ) : post
                            ),
                        } ) ),
                    };
                }
            );
        },
        onError: ( _, { id } ) => {
            queryClient.invalidateQueries( { queryKey: postKeys.detail( id ) } );
            queryClient.invalidateQueries( { queryKey: postKeys.lists() } );
        },
    } );
}

// Remove vote mutation
export function useRemoveVote() {
    const queryClient = useQueryClient();

    return useMutation( {
        mutationFn: ( id: string ) => apiService.removeVotePost( id ),
        onMutate: async ( id ) => {
            // Optimistically update
            const updatePost = ( post: Post ) => ( {
                ...post,
                isUpvoted: false,
                isDownvoted: false,
                _count: {
                    ...post._count,
                    upvotes: post.isUpvoted ? Math.max( 0, post._count.upvotes - 1 ) : post._count.upvotes,
                    downvotes: post.isDownvoted ? Math.max( 0, post._count.downvotes - 1 ) : post._count.downvotes,
                },
            } );

            // Update single post
            queryClient.setQueryData( postKeys.detail( id ), ( old: Post | undefined ) => {
                if ( !old ) return old;
                return updatePost( old );
            } );

            // Update in lists
            queryClient.setQueriesData(
                { queryKey: postKeys.lists() },
                ( old: any ) => {
                    if ( !old ) return old;

                    return {
                        ...old,
                        pages: old.pages.map( ( page: PostsResponse ) => ( {
                            ...page,
                            data: page.data.map( ( post: Post ) =>
                                post.id === id ? updatePost( post ) : post
                            ),
                        } ) ),
                    };
                }
            );
        },
        onError: ( _, id ) => {
            queryClient.invalidateQueries( { queryKey: postKeys.detail( id ) } );
            queryClient.invalidateQueries( { queryKey: postKeys.lists() } );
        },
    } );
}

// Share post mutation
export function useSharePost() {
    const queryClient = useQueryClient();

    return useMutation( {
        mutationFn: ( { id, data }: { id: string; data?: ShareRequest } ) =>
            apiService.sharePost( id, data ),
        onMutate: async ( { id } ) => {
            // Optimistically update
            const updatePost = ( post: Post ) => ( {
                ...post,
                isShared: true,
                _count: {
                    ...post._count,
                    shares: post._count.shares + 1,
                },
            } );

            // Update single post
            queryClient.setQueryData( postKeys.detail( id ), ( old: Post | undefined ) => {
                if ( !old ) return old;
                return updatePost( old );
            } );

            // Update in lists
            queryClient.setQueriesData(
                { queryKey: postKeys.lists() },
                ( old: any ) => {
                    if ( !old ) return old;

                    return {
                        ...old,
                        pages: old.pages.map( ( page: PostsResponse ) => ( {
                            ...page,
                            data: page.data.map( ( post: Post ) =>
                                post.id === id ? updatePost( post ) : post
                            ),
                        } ) ),
                    };
                }
            );
        },
        onError: ( _, { id } ) => {
            queryClient.invalidateQueries( { queryKey: postKeys.detail( id ) } );
            queryClient.invalidateQueries( { queryKey: postKeys.lists() } );
        },
    } );
}
