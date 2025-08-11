import { z } from "zod";

// Post schemas
export const postSchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(2000, "Content must be less than 2000 characters"),
  media: z.array(z.instanceof(File)).optional(),
  hashtags: z.array(z.string()).optional(),
  mentions: z.array(z.string()).optional(),
});

export const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment is required")
    .max(500, "Comment must be less than 500 characters"),
  parentId: z.string().optional(),
});

// Profile schemas
export const profileSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email format").optional(),
  whatsapp: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
    .optional(),
  twitterLink: z.string().url("Invalid Twitter URL").optional(),
  tiktokLink: z.string().url("Invalid TikTok URL").optional(),
  instagramLink: z.string().url("Invalid Instagram URL").optional(),
  bio: z.string().max(200, "Bio must be less than 200 characters").optional(),
  avatar: z.instanceof(File).optional(),
});

// Message schemas
export const messageSchema = z.object({
  content: z
    .string()
    .min(1, "Message is required")
    .max(1000, "Message must be less than 1000 characters"),
  media: z.array(z.instanceof(File)).optional(),
});

// Search schemas
export const searchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  type: z.enum(["users", "posts", "all"]).default("all"),
});

// Export types
export type PostFormData = z.infer<typeof postSchema>;
export type CommentFormData = z.infer<typeof commentSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type MessageFormData = z.infer<typeof messageSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
