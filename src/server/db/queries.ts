import { eq } from 'drizzle-orm';
import { db } from './client';
import { users, posts } from './schema';
import type { NewUser, NewPost } from './schema';

// ============ USERS ============

export async function getUserById(userId: string) {
  const result = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      posts: true,
    },
  });
  return result;
}

export async function getUserByClerkId(clerkId: string) {
  const result = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
    with: {
      posts: true,
    },
  });
  return result;
}

export async function createUser(user: NewUser) {
  const result = await db.insert(users).values(user).returning();
  return result[0];
}

export async function updateUser(
  userId: string,
  data: Partial<Omit<NewUser, 'id' | 'clerkId'>>,
) {
  const result = await db
    .update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();
  return result[0];
}

export async function deleteUser(userId: string) {
  await db.delete(users).where(eq(users.id, userId));
}

// ============ POSTS ============

export async function getPostById(postId: string) {
  const result = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
    with: {
      author: true,
    },
  });
  return result;
}

export async function getUserPosts(userId: string) {
  const result = await db.query.posts.findMany({
    where: eq(posts.userId, userId),
    with: {
      author: true,
    },
  });
  return result;
}

export async function getAllPosts() {
  const result = await db.query.posts.findMany({
    with: {
      author: true,
    },
  });
  return result;
}

export async function getPublishedPosts() {
  const result = await db.query.posts.findMany({
    where: eq(posts.published, true),
    with: {
      author: true,
    },
  });
  return result;
}

export async function createPost(post: NewPost) {
  const result = await db.insert(posts).values(post).returning();
  return result[0];
}

export async function updatePost(
  postId: string,
  data: Partial<Omit<NewPost, 'id' | 'userId'>>,
) {
  const result = await db
    .update(posts)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, postId))
    .returning();
  return result[0];
}

export async function deletePost(postId: string) {
  await db.delete(posts).where(eq(posts.id, postId));
}
