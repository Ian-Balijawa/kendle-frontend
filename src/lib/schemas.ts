import { z } from "zod";

export const mediaInputSchema = z.object({
  type: z.enum(["image", "video"]),
  url: z.string().url("Invalid URL"),
  thumbnailUrl: z.string().url("Invalid thumbnail URL").optional(),
  altText: z.string().optional(),
  caption: z.string().optional(),
  fileSize: z.number().min(0),
  duration: z.number().min(0).optional(),
  width: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
  format: z.string().optional(),
});

export const tagInputSchema = z.object({
  name: z.string().min(1, "Tag name is required").max(50, "Tag name too long"),
  description: z.string().max(200, "Description too long").optional(),
});

export const mentionInputSchema = z.object({
  mentionedUserId: z.string().min(1, "User ID is required"),
  postId: z.string().optional(),
  commentId: z.string().optional(),
});

export const postSchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(2000, "Content must be less than 2000 characters"),
  media: z.array(mediaInputSchema).optional(),
  location: z.string().optional(),
  tags: z.array(tagInputSchema).optional(),
  mentions: z.array(mentionInputSchema).optional(),
  type: z
    .enum([
      "text",
      "image",
      "video",
      "poll",
      "event",
      "repost",
      "quote",
      "article",
      "story",
    ])
    .default("text"),
  isPublic: z.boolean().default(true),
  allowComments: z.boolean().default(true),
  allowLikes: z.boolean().default(true),
  allowShares: z.boolean().default(true),
  allowBookmarks: z.boolean().default(true),
  allowReactions: z.boolean().default(true),
  isRepost: z.boolean().default(false),
  isQuote: z.boolean().default(false),
  isArticle: z.boolean().default(false),
  isStory: z.boolean().default(false),
  pollQuestion: z.string().optional(),
  pollOptions: z.array(z.string()).optional(),
  pollEndDate: z.string().optional(),
  eventTitle: z.string().optional(),
  eventDescription: z.string().optional(),
  eventStartDate: z.string().optional(),
  eventEndDate: z.string().optional(),
  eventLocation: z.string().optional(),
  eventCapacity: z.number().min(1).optional(),
  originalPostId: z.string().optional(),
  repostContent: z.string().optional(),
  scheduledAt: z.string().optional(),
});

export const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment is required")
    .max(500, "Comment must be less than 500 characters"),
  parentId: z.string().optional(),
});

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

export const messageSchema = z.object({
  content: z
    .string()
    .min(1, "Message is required")
    .max(1000, "Message must be less than 1000 characters"),
  media: z.array(z.instanceof(File)).optional(),
});

export const searchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  type: z.enum(["users", "posts", "all"]).default("all"),
});

export type PostFormData = z.infer<typeof postSchema>;
export type MediaInputData = z.infer<typeof mediaInputSchema>;
export type TagInputData = z.infer<typeof tagInputSchema>;
export type MentionInputData = z.infer<typeof mentionInputSchema>;
export type CommentFormData = z.infer<typeof commentSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type MessageFormData = z.infer<typeof messageSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
