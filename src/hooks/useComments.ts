import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService, CreateCommentRequest, GetCommentsParams, UpdateCommentRequest } from '../services/api';
import { Comment, CommentsResponse } from '../types';
import { useAuthStore } from '../stores/authStore';
import { postKeys } from './usePosts';

// Query keys
export const commentKeys = {
    all: ['comments'] as const,
    lists: () => [...commentKeys.all, 'list'] as const,
    list: ( postId: string, params?: GetCommentsParams ) => [...commentKeys.lists(), postId, params] as const,
    details: () => [...commentKeys.all, 'detail'] as const,
    detail: ( id: string ) => [...commentKeys.details(), id] as const,
    user: ( userId: string ) => [...commentKeys.all, 'user', userId] as const,
    liked: () => [...commentKeys.all, 'liked'] as const,
    me: () => [...commentKeys.all, 'me'] as const,
    search: ( query: string, params?: any ) => [...commentKeys.all, 'search', query, params] as const,
    stats: ( postId: string ) => [...commentKeys.all, 'stats', postId] as const,
};

// Get comments for a post with infinite scroll
export function useInfiniteComments( postId: string, params: GetCommentsParams = {} ) {
    return useInfiniteQuery( {
        queryKey: commentKeys.list( postId, params ),
        queryFn: ( { pageParam = 1 } ) =>
            apiService.getComments( postId, { ...params, page: pageParam } ),
        getNextPageParam: ( lastPage: CommentsResponse ) => {
            if ( lastPage.pagination.page < lastPage.pagination.totalPages ) {
                return lastPage.pagination.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        staleTime: 2 * 60 * 1000, // 2 minutes
    } );
}

// Get comments for a post (regular pagination)
export function useComments( postId: string, params: GetCommentsParams = {} ) {
    return useQuery( {
        queryKey: commentKeys.list( postId, params ),
        queryFn: () => apiService.getComments( postId, params ),
        staleTime: 2 * 60 * 1000,
    } );
}

// Get single comment
export function useComment( id: string ) {
    return useQuery( {
        queryKey: commentKeys.detail( id ),
        queryFn: () => apiService.getComment( id ),
        staleTime: 5 * 60 * 1000,
    } );
}

// Get my comments
export function useMyComments( params: { page?: number; limit?: number } = {} ) {
    return useInfiniteQuery( {
        queryKey: [...commentKeys.me(), params],
        queryFn: ( { pageParam = 1 } ) =>
            apiService.getMyComments( { ...params, page: pageParam } ),
        getNextPageParam: ( lastPage: CommentsResponse ) => {
            if ( lastPage.pagination.page < lastPage.pagination.totalPages ) {
                return lastPage.pagination.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
    } );
}

// Get user comments
export function useUserComments( userId: string, params: { page?: number; limit?: number } = {} ) {
    return useInfiniteQuery( {
        queryKey: [...commentKeys.user( userId ), params],
        queryFn: ( { pageParam = 1 } ) =>
            apiService.getUserComments( userId, { ...params, page: pageParam } ),
        getNextPageParam: ( lastPage: CommentsResponse ) => {
            if ( lastPage.pagination.page < lastPage.pagination.totalPages ) {
                return lastPage.pagination.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
    } );
}

// Get liked comments
export function useLikedComments( params: { page?: number; limit?: number } = {} ) {
    return useInfiniteQuery( {
        queryKey: [...commentKeys.liked(), params],
        queryFn: ( { pageParam = 1 } ) =>
            apiService.getLikedComments( { ...params, page: pageParam } ),
        getNextPageParam: ( lastPage: CommentsResponse ) => {
            if ( lastPage.pagination.page < lastPage.pagination.totalPages ) {
                return lastPage.pagination.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
    } );
}

// Search comments
export function useSearchComments( params: { q: string; postId?: string; page?: number; limit?: number } ) {
    return useInfiniteQuery( {
        queryKey: commentKeys.search( params.q, params ),
        queryFn: ( { pageParam = 1 } ) =>
            apiService.searchComments( { ...params, page: pageParam } ),
        getNextPageParam: ( lastPage: CommentsResponse ) => {
            if ( lastPage.pagination.page < lastPage.pagination.totalPages ) {
                return lastPage.pagination.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        enabled: !!params.q.trim(),
    } );
}

// Get comment stats
export function useCommentStats( postId: string ) {
    return useQuery( {
        queryKey: commentKeys.stats( postId ),
        queryFn: () => apiService.getCommentStats( postId ),
        staleTime: 5 * 60 * 1000,
    } );
}

// Create comment mutation
export function useCreateComment() {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    return useMutation( {
        mutationFn: ( { postId, data }: { postId: string; data: CreateCommentRequest } ) =>
            apiService.createComment( postId, data ),
        onMutate: async ( { postId, data } ) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries( { queryKey: commentKeys.list( postId ) } );
            await queryClient.cancelQueries( { queryKey: postKeys.detail( postId ) } );
            await queryClient.cancelQueries( { queryKey: postKeys.lists() } );

            // Create optimistic comment
            const optimisticComment: Comment = {
                id: `temp-${Date.now()}`,
                content: data.content,
                author: user!,
                postId,
                parentId: data.parentCommentId,
                replies: [],
                likes: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                _count: {
                    likes: 0,
                    replies: 0,
                },
            };

            // Optimistically update comments list
            queryClient.setQueriesData(
                { queryKey: commentKeys.list( postId ) },
                ( old: any ) => {
                    if ( !old ) return old;

                    // Handle infinite query
                    if ( old.pages ) {
                        return {
                            ...old,
                            pages: old.pages.map( ( page: CommentsResponse, index: number ) => {
                                if ( index === 0 ) {
                                    return {
                                        ...page,
                                        data: [optimisticComment, ...page.data],
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

                    // Handle regular query
                    return {
                        ...old,
                        data: [optimisticComment, ...old.data],
                        pagination: {
                            ...old.pagination,
                            total: old.pagination.total + 1,
                        },
                    };
                }
            );

            // Optimistically update post comment count
            queryClient.setQueryData( postKeys.detail( postId ), ( old: any ) => {
                if ( !old ) return old;
                return {
                    ...old,
                    _count: {
                        ...old._count,
                        comments: old._count.comments + 1,
                    },
                };
            } );

            // Update post in lists
            queryClient.setQueriesData(
                { queryKey: postKeys.lists() },
                ( old: any ) => {
                    if ( !old ) return old;

                    return {
                        ...old,
                        pages: old.pages.map( ( page: any ) => ( {
                            ...page,
                            data: page.data.map( ( post: any ) =>
                                post.id === postId
                                    ? {
                                        ...post,
                                        _count: {
                                            ...post._count,
                                            comments: post._count.comments + 1,
                                        },
                                    }
                                    : post
                            ),
                        } ) ),
                    };
                }
            );

            return { optimisticComment };
        },
        onError: ( err, { postId }, context ) => {
            // Revert the optimistic updates
            if ( context?.optimisticComment ) {
                queryClient.setQueriesData(
                    { queryKey: commentKeys.list( postId ) },
                    ( old: any ) => {
                        if ( !old ) return old;

                        // Handle infinite query
                        if ( old.pages ) {
                            return {
                                ...old,
                                pages: old.pages.map( ( page: CommentsResponse, index: number ) => {
                                    if ( index === 0 ) {
                                        return {
                                            ...page,
                                            data: page.data.filter( ( comment: Comment ) => comment.id !== context.optimisticComment.id ),
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

                        // Handle regular query
                        return {
                            ...old,
                            data: old.data.filter( ( comment: Comment ) => comment.id !== context.optimisticComment.id ),
                            pagination: {
                                ...old.pagination,
                                total: Math.max( 0, old.pagination.total - 1 ),
                            },
                        };
                    }
                );

                // Revert post comment count
                queryClient.setQueryData( postKeys.detail( postId ), ( old: any ) => {
                    if ( !old ) return old;
                    return {
                        ...old,
                        _count: {
                            ...old._count,
                            comments: Math.max( 0, old._count.comments - 1 ),
                        },
                    };
                } );
            }
        },
        onSuccess: ( newComment, { postId }, context ) => {
            // Replace the optimistic comment with the real one
            if ( context?.optimisticComment ) {
                queryClient.setQueriesData(
                    { queryKey: commentKeys.list( postId ) },
                    ( old: any ) => {
                        if ( !old ) return old;

                        // Handle infinite query
                        if ( old.pages ) {
                            return {
                                ...old,
                                pages: old.pages.map( ( page: CommentsResponse, index: number ) => {
                                    if ( index === 0 ) {
                                        return {
                                            ...page,
                                            data: page.data.map( ( comment: Comment ) =>
                                                comment.id === context.optimisticComment.id ? newComment : comment
                                            ),
                                        };
                                    }
                                    return page;
                                } ),
                            };
                        }

                        // Handle regular query
                        return {
                            ...old,
                            data: old.data.map( ( comment: Comment ) =>
                                comment.id === context.optimisticComment.id ? newComment : comment
                            ),
                        };
                    }
                );
            }

            // Invalidate and refetch
            queryClient.invalidateQueries( { queryKey: commentKeys.list( postId ) } );
            queryClient.invalidateQueries( { queryKey: postKeys.detail( postId ) } );
            queryClient.invalidateQueries( { queryKey: postKeys.lists() } );
            queryClient.invalidateQueries( { queryKey: commentKeys.me() } );
        },
    } );
}

// Update comment mutation
export function useUpdateComment() {
    const queryClient = useQueryClient();

    return useMutation( {
        mutationFn: ( { id, data }: { id: string; data: UpdateCommentRequest } ) =>
            apiService.updateComment( id, data ),
        onMutate: async ( { id, data } ) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries( { queryKey: commentKeys.detail( id ) } );

            // Snapshot the previous value
            const previousComment = queryClient.getQueryData( commentKeys.detail( id ) );

            // Optimistically update the single comment
            queryClient.setQueryData( commentKeys.detail( id ), ( old: Comment | undefined ) => {
                if ( !old ) return old;
                return {
                    ...old,
                    ...data,
                    updatedAt: new Date().toISOString(),
                };
            } );

            // Optimistically update in comments lists
            queryClient.setQueriesData(
                { queryKey: commentKeys.lists() },
                ( old: any ) => {
                    if ( !old ) return old;

                    // Handle infinite query
                    if ( old.pages ) {
                        return {
                            ...old,
                            pages: old.pages.map( ( page: CommentsResponse ) => ( {
                                ...page,
                                data: page.data.map( ( comment: Comment ) =>
                                    comment.id === id
                                        ? { ...comment, ...data, updatedAt: new Date().toISOString() }
                                        : comment
                                ),
                            } ) ),
                        };
                    }

                    // Handle regular query
                    return {
                        ...old,
                        data: old.data.map( ( comment: Comment ) =>
                            comment.id === id
                                ? { ...comment, ...data, updatedAt: new Date().toISOString() }
                                : comment
                        ),
                    };
                }
            );

            return { previousComment };
        },
        onError: ( err, { id }, context ) => {
            // Revert the optimistic updates
            if ( context?.previousComment ) {
                queryClient.setQueryData( commentKeys.detail( id ), context.previousComment );
            }
            queryClient.invalidateQueries( { queryKey: commentKeys.lists() } );
        },
        onSuccess: ( updatedComment, { id } ) => {
            // Update the cache with the server response
            queryClient.setQueryData( commentKeys.detail( id ), updatedComment );
            queryClient.invalidateQueries( { queryKey: commentKeys.lists() } );
        },
    } );
}

// Delete comment mutation
export function useDeleteComment() {
    const queryClient = useQueryClient();

    return useMutation( {
        mutationFn: ( id: string ) => apiService.deleteComment( id ),
        onMutate: async ( id ) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries( { queryKey: commentKeys.lists() } );

            // Find the comment to get its postId
            let postId: string | null = null;
            const commentQueries = queryClient.getQueriesData( { queryKey: commentKeys.lists() } );

            for ( const [queryKey, data] of commentQueries ) {
                if ( data && typeof data === 'object' ) {
                    const queryData = data as any;
                    const pages = queryData.pages || [queryData];

                    for ( const page of pages ) {
                        const comment = page.data?.find( ( c: Comment ) => c.id === id );
                        if ( comment ) {
                            postId = comment.postId;
                            break;
                        }
                    }
                    if ( postId ) break;
                }
            }

            // Snapshot the previous value
            const previousData = queryClient.getQueriesData( { queryKey: commentKeys.lists() } );

            // Optimistically remove the comment from all lists
            queryClient.setQueriesData(
                { queryKey: commentKeys.lists() },
                ( old: any ) => {
                    if ( !old ) return old;

                    // Handle infinite query
                    if ( old.pages ) {
                        return {
                            ...old,
                            pages: old.pages.map( ( page: CommentsResponse ) => ( {
                                ...page,
                                data: page.data.filter( ( comment: Comment ) => comment.id !== id ),
                                pagination: {
                                    ...page.pagination,
                                    total: Math.max( 0, page.pagination.total - 1 ),
                                },
                            } ) ),
                        };
                    }

                    // Handle regular query
                    return {
                        ...old,
                        data: old.data.filter( ( comment: Comment ) => comment.id !== id ),
                        pagination: {
                            ...old.pagination,
                            total: Math.max( 0, old.pagination.total - 1 ),
                        },
                    };
                }
            );

            // Update post comment count if we found the postId
            if ( postId ) {
                queryClient.setQueryData( postKeys.detail( postId ), ( old: any ) => {
                    if ( !old ) return old;
                    return {
                        ...old,
                        _count: {
                            ...old._count,
                            comments: Math.max( 0, old._count.comments - 1 ),
                        },
                    };
                } );

                // Update post in lists
                queryClient.setQueriesData(
                    { queryKey: postKeys.lists() },
                    ( old: any ) => {
                        if ( !old ) return old;

                        return {
                            ...old,
                            pages: old.pages.map( ( page: any ) => ( {
                                ...page,
                                data: page.data.map( ( post: any ) =>
                                    post.id === postId
                                        ? {
                                            ...post,
                                            _count: {
                                                ...post._count,
                                                comments: Math.max( 0, post._count.comments - 1 ),
                                            },
                                        }
                                        : post
                                ),
                            } ) ),
                        };
                    }
                );
            }

            return { previousData, postId };
        },
        onError: ( err, id, context ) => {
            // Revert the optimistic updates
            if ( context?.previousData ) {
                context.previousData.forEach( ( [queryKey, data] ) => {
                    queryClient.setQueryData( queryKey, data );
                } );
            }

            if ( context?.postId ) {
                queryClient.invalidateQueries( { queryKey: postKeys.detail( context.postId ) } );
                queryClient.invalidateQueries( { queryKey: postKeys.lists() } );
            }
        },
        onSuccess: ( _, id, context ) => {
            // Remove the comment detail from cache
            queryClient.removeQueries( { queryKey: commentKeys.detail( id ) } );
            queryClient.invalidateQueries( { queryKey: commentKeys.lists() } );

            if ( context?.postId ) {
                queryClient.invalidateQueries( { queryKey: postKeys.detail( context.postId ) } );
                queryClient.invalidateQueries( { queryKey: postKeys.lists() } );
            }
        },
    } );
}

// Like comment mutation
export function useLikeComment() {
    const queryClient = useQueryClient();

    return useMutation( {
        mutationFn: ( id: string ) => apiService.likeComment( id ),
        onMutate: async ( id ) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries( { queryKey: commentKeys.detail( id ) } );
            await queryClient.cancelQueries( { queryKey: commentKeys.lists() } );

            // Optimistically update
            const updateComment = ( comment: Comment ) => ( {
                ...comment,
                _count: {
                    ...comment._count,
                    likes: comment._count.likes + 1,
                },
            } );

            // Update single comment
            queryClient.setQueryData( commentKeys.detail( id ), ( old: Comment | undefined ) => {
                if ( !old ) return old;
                return updateComment( old );
            } );

            // Update in lists
            queryClient.setQueriesData(
                { queryKey: commentKeys.lists() },
                ( old: any ) => {
                    if ( !old ) return old;

                    // Handle infinite query
                    if ( old.pages ) {
                        return {
                            ...old,
                            pages: old.pages.map( ( page: CommentsResponse ) => ( {
                                ...page,
                                data: page.data.map( ( comment: Comment ) =>
                                    comment.id === id ? updateComment( comment ) : comment
                                ),
                            } ) ),
                        };
                    }

                    // Handle regular query
                    return {
                        ...old,
                        data: old.data.map( ( comment: Comment ) =>
                            comment.id === id ? updateComment( comment ) : comment
                        ),
                    };
                }
            );
        },
        onError: ( err, id ) => {
            // Revert the optimistic updates
            queryClient.invalidateQueries( { queryKey: commentKeys.detail( id ) } );
            queryClient.invalidateQueries( { queryKey: commentKeys.lists() } );
        },
    } );
}

// Unlike comment mutation
export function useUnlikeComment() {
    const queryClient = useQueryClient();

    return useMutation( {
        mutationFn: ( id: string ) => apiService.unlikeComment( id ),
        onMutate: async ( id ) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries( { queryKey: commentKeys.detail( id ) } );
            await queryClient.cancelQueries( { queryKey: commentKeys.lists() } );

            // Optimistically update
            const updateComment = ( comment: Comment ) => ( {
                ...comment,
                _count: {
                    ...comment._count,
                    likes: Math.max( 0, comment._count.likes - 1 ),
                },
            } );

            // Update single comment
            queryClient.setQueryData( commentKeys.detail( id ), ( old: Comment | undefined ) => {
                if ( !old ) return old;
                return updateComment( old );
            } );

            // Update in lists
            queryClient.setQueriesData(
                { queryKey: commentKeys.lists() },
                ( old: any ) => {
                    if ( !old ) return old;

                    // Handle infinite query
                    if ( old.pages ) {
                        return {
                            ...old,
                            pages: old.pages.map( ( page: CommentsResponse ) => ( {
                                ...page,
                                data: page.data.map( ( comment: Comment ) =>
                                    comment.id === id ? updateComment( comment ) : comment
                                ),
                            } ) ),
                        };
                    }

                    // Handle regular query
                    return {
                        ...old,
                        data: old.data.map( ( comment: Comment ) =>
                            comment.id === id ? updateComment( comment ) : comment
                        ),
                    };
                }
            );
        },
        onError: ( err, id ) => {
            // Revert the optimistic updates
            queryClient.invalidateQueries( { queryKey: commentKeys.detail( id ) } );
            queryClient.invalidateQueries( { queryKey: commentKeys.lists() } );
        },
    } );
}

// Hide comment mutation (admin/moderator only)
export function useHideComment() {
    const queryClient = useQueryClient();

    return useMutation( {
        mutationFn: ( { id, reason }: { id: string; reason?: string } ) =>
            apiService.hideComment( id, reason ),
        onSuccess: ( _, { id } ) => {
            queryClient.invalidateQueries( { queryKey: commentKeys.detail( id ) } );
            queryClient.invalidateQueries( { queryKey: commentKeys.lists() } );
        },
    } );
}

// Unhide comment mutation (admin/moderator only)
export function useUnhideComment() {
    const queryClient = useQueryClient();

    return useMutation( {
        mutationFn: ( id: string ) => apiService.unhideComment( id ),
        onSuccess: ( _, id ) => {
            queryClient.invalidateQueries( { queryKey: commentKeys.detail( id ) } );
            queryClient.invalidateQueries( { queryKey: commentKeys.lists() } );
        },
    } );
}
