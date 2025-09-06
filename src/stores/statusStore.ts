import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import { devtools } from "zustand/middleware";
import { Status, StatusCollection } from "../types";

interface StatusStore {
  statuses: Status[];
  statusCollections: StatusCollection[];
  selectedStatus: Status | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setStatuses: (statuses: Status[]) => void;
  setStatusCollections: (collections: StatusCollection[]) => void;
  addStatus: (status: Status) => void;
  deleteStatus: (id: string) => void;
  viewStatus: (id: string, userId: string) => void;
  setSelectedStatus: (status: Status | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  cleanupExpiredStatuses: () => void;
}

export const useStatusStore = create<StatusStore>()(
  devtools(
    persist(
      subscribeWithSelector((set) => ({
        statuses: [],
        statusCollections: [],
        selectedStatus: null,
        isLoading: false,
        error: null,

        setStatuses: (statuses: Status[]) => {
          set({ statuses }, false, "status/setStatuses");
        },

        setStatusCollections: (collections: StatusCollection[]) => {
          set(
            { statusCollections: collections },
            false,
            "status/setStatusCollections",
          );
        },

        addStatus: (status: Status) => {
          set(
            (state) => {
              // Add to statuses list
              const newStatuses = [status, ...state.statuses];

              // Update status collections
              const existingCollectionIndex = state.statusCollections.findIndex(
                (collection) => collection.author.id === status.author.id,
              );

              let newStatusCollections = [...state.statusCollections];

              if (existingCollectionIndex >= 0) {
                // Update existing collection
                newStatusCollections[existingCollectionIndex] = {
                  ...newStatusCollections[existingCollectionIndex],
                  statuses: [
                    status,
                    ...newStatusCollections[existingCollectionIndex].statuses,
                  ],
                  hasUnviewed: true,
                  lastUpdated: status.createdAt,
                };
              } else {
                // Create new collection
                const newCollection: StatusCollection = {
                  author: status.author,
                  statuses: [status],
                  hasUnviewed: true,
                  lastUpdated: status.createdAt,
                };
                newStatusCollections = [newCollection, ...newStatusCollections];
              }

              return {
                statuses: newStatuses,
                statusCollections: newStatusCollections,
              };
            },
            false,
            "status/addStatus",
          );
        },

        deleteStatus: (id: string) => {
          set(
            (state) => {
              const deletedStatus = state.statuses.find((s) => s.id === id);
              const newStatuses = state.statuses.filter(
                (status) => status.id !== id,
              );

              // Update status collections
              let newStatusCollections = state.statusCollections.map(
                (collection) => ({
                  ...collection,
                  statuses: collection.statuses.filter(
                    (status) => status.id !== id,
                  ),
                }),
              );

              // Remove empty collections
              newStatusCollections = newStatusCollections.filter(
                (collection) => collection.statuses.length > 0,
              );

              // Update last updated time for affected collections
              if (deletedStatus) {
                newStatusCollections = newStatusCollections.map(
                  (collection) => {
                    if (
                      collection.author.id === deletedStatus.author.id &&
                      collection.statuses.length > 0
                    ) {
                      return {
                        ...collection,
                        lastUpdated: collection.statuses[0].createdAt,
                      };
                    }
                    return collection;
                  },
                );
              }

              return {
                statuses: newStatuses,
                statusCollections: newStatusCollections,
                selectedStatus:
                  state.selectedStatus?.id === id ? null : state.selectedStatus,
              };
            },
            false,
            "status/deleteStatus",
          );
        },

        viewStatus: (id: string, userId: string) => {
          set(
            (state) => {
              const now = new Date().toISOString();

              // Check if user has already viewed this status
              const status = state.statuses.find((s) => s.id === id);
              if (!status || status.isViewed) {
                return state; // No changes needed
              }

              const newStatuses = state.statuses.map((status) =>
                status.id === id
                  ? {
                      ...status,
                      isViewed: true,
                      viewsCount: status.viewsCount + 1,
                      views: [
                        ...status.views,
                        {
                          id: Date.now().toString(),
                          userId,
                          statusId: id,
                          viewedAt: now,
                        },
                      ],
                    }
                  : status,
              );

              // Update status collections
              const newStatusCollections = state.statusCollections.map(
                (collection) => {
                  const updatedStatuses = collection.statuses.map((status) =>
                    status.id === id
                      ? {
                          ...status,
                          isViewed: true,
                          viewsCount: status.viewsCount + 1,
                          views: [
                            ...status.views,
                            {
                              id: Date.now().toString(),
                              userId,
                              statusId: id,
                              viewedAt: now,
                            },
                          ],
                        }
                      : status,
                  );

                  // Check if all statuses in this collection are viewed
                  const hasUnviewed = updatedStatuses.some(
                    (status) => !status.isViewed,
                  );

                  return {
                    ...collection,
                    statuses: updatedStatuses,
                    hasUnviewed,
                  };
                },
              );

              return {
                statuses: newStatuses,
                statusCollections: newStatusCollections,
                selectedStatus:
                  state.selectedStatus?.id === id
                    ? {
                        ...state.selectedStatus,
                        isViewed: true,
                        viewsCount: state.selectedStatus.viewsCount + 1,
                        views: [
                          ...state.selectedStatus.views,
                          {
                            id: Date.now().toString(),
                            userId,
                            statusId: id,
                            viewedAt: now,
                          },
                        ],
                      }
                    : state.selectedStatus,
              };
            },
            false,
            "status/viewStatus",
          );
        },

        cleanupExpiredStatuses: () => {
          set(
            (state) => {
              const now = new Date();

              const activeStatuses = state.statuses.filter((status) => {
                const expiresAt = new Date(status.expiresAt);
                return expiresAt > now;
              });

              // Update status collections with only active statuses
              let activeStatusCollections = state.statusCollections.map(
                (collection) => ({
                  ...collection,
                  statuses: collection.statuses.filter((status) => {
                    const expiresAt = new Date(status.expiresAt);
                    return expiresAt > now;
                  }),
                }),
              );

              // Remove empty collections
              activeStatusCollections = activeStatusCollections.filter(
                (collection) => collection.statuses.length > 0,
              );

              return {
                statuses: activeStatuses,
                statusCollections: activeStatusCollections,
                selectedStatus:
                  state.selectedStatus &&
                  new Date(state.selectedStatus.expiresAt) > now
                    ? state.selectedStatus
                    : null,
              };
            },
            false,
            "status/cleanupExpiredStatuses",
          );
        },

        setSelectedStatus: (status: Status | null) => {
          set({ selectedStatus: status }, false, "status/setSelectedStatus");
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading }, false, "status/setLoading");
        },

        setError: (error: string | null) => {
          set({ error }, false, "status/setError");
        },

        clearError: () => {
          set({ error: null }, false, "status/clearError");
        },
      })),
      {
        name: "status-store",
        partialize: (state) => ({
          // Don't persist statuses as they expire quickly
          // Only persist collections for better UX
          statusCollections: state.statusCollections,
        }),
      },
    ),
    {
      name: "Status Store",
      enabled: true,
    },
  ),
);
