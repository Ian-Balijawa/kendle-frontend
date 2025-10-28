import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { apiService } from "../services/api";
import type {
    SearchParams,
    SearchResponse,
    UserSearchParams,
    UserSearchResponse,
    PostSearchParams,
    PostSearchResponse,
} from "../services/api";

// Unified search hook for all types
export function useSearch(params: SearchParams) {
    return useQuery({
        queryKey: ["search", params],
        queryFn: () => apiService.search(params),
        enabled: !!params.q && params.q.trim().length > 0,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

// User search hook
export function useUserSearch(params: UserSearchParams) {
    return useQuery({
        queryKey: ["userSearch", params],
        queryFn: () => apiService.searchUsers(params),
        enabled: !!params.q && params.q.trim().length > 0,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

// Post search hook
export function usePostSearch(params: PostSearchParams) {
    return useQuery({
        queryKey: ["postSearch", params],
        queryFn: () => apiService.searchPosts(params),
        enabled: !!params.q && params.q.trim().length > 0,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

// Infinite user search hook for pagination
export function useInfiniteUserSearch(params: Omit<UserSearchParams, "page">) {
    return useInfiniteQuery({
        queryKey: ["infiniteUserSearch", params],
        queryFn: ({ pageParam = 1 }) =>
            apiService.searchUsers({ ...params, page: pageParam }),
        enabled: !!params.q && params.q.trim().length > 0,
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.totalPages) {
                return lastPage.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

// Infinite post search hook for pagination
export function useInfinitePostSearch(params: Omit<PostSearchParams, "page">) {
    return useInfiniteQuery({
        queryKey: ["infinitePostSearch", params],
        queryFn: ({ pageParam = 1 }) =>
            apiService.searchPosts({ ...params, page: pageParam }),
        enabled: !!params.q && params.q.trim().length > 0,
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.totalPages) {
                return lastPage.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

// Infinite unified search hook for pagination
export function useInfiniteSearch(params: Omit<SearchParams, "page">) {
    return useInfiniteQuery({
        queryKey: ["infiniteSearch", params],
        queryFn: ({ pageParam = 1 }) =>
            apiService.search({ ...params, page: pageParam }),
        enabled: !!params.q && params.q.trim().length > 0,
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.totalPages) {
                return lastPage.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}
