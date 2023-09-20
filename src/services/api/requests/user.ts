import { User, WithId } from '../../../types/api';
import api from '../api';

const PAGINATED_LIMIT = 15;

const test = async () => {
  return await api.get<{ data: string }>('/');
};

const getUser = async ({
  userId,
  email,
  oauthId,
  excludeNestedFields,
}: {
  userId?: string;
  email?: string;
  oauthId?: string;
  excludeNestedFields?: boolean;
}) => {
  let queryString = '?';
  if (userId) {
    queryString += `userId=${userId}`;
  } else if (email) {
    queryString += `email=${email}`;
  } else if (oauthId) {
    queryString += `oauthId=${oauthId}`;
  }
  if (queryString === '?') {
    throw new Error('Must provide at least one of userId, email, or oauthId');
  }
  if (excludeNestedFields) {
    queryString += `&excludeNestedFields=${excludeNestedFields}`;
  }
  return await api.get<WithId<User>>(`user${queryString}`);
};

const listFollowingPaginated = async ({
  userId,
  pageNumber,
  includeRecentPredictionSets, // pass for when we want friends' recent predictions
}: {
  userId: string;
  pageNumber: number;
  includeRecentPredictionSets?: boolean;
}) => {
  return await api.get<WithId<User>>(
    `users/${userId}/following?pageNumber=${pageNumber}&limit=${PAGINATED_LIMIT}&includeRecentPredictionSets=${!!includeRecentPredictionSets}`,
  );
};

const listFollowersPaginated = async ({
  userId,
  pageNumber,
}: {
  userId: string;
  pageNumber: number;
}) => {
  return await api.get<WithId<User>>(
    `users/${userId}/followers?pageNumber=${pageNumber}&limit=${PAGINATED_LIMIT}`,
  );
};

// TODO: Be careful using this because it can be expensive. Don't debounce, just submit on blur or with a button
const searchUsers = async ({
  query,
  pageNumber,
}: {
  query: string;
  pageNumber: number;
}) => {
  return await api.get<WithId<User>>(
    `users/search?query=${query}&pageNumber=${pageNumber}&limit=${PAGINATED_LIMIT}`,
  );
};

type iCreateUserPayload = {
  email: string;
  name?: string;
  oauthId?: string;
  username?: string;
};

const createUser = async (payload: iCreateUserPayload) => {
  return await api.post<string | undefined, iCreateUserPayload>('users', payload);
};

const updateUser = async (payload: Partial<User>) => {
  return await api.put<undefined, Partial<User>>('users', payload);
};

export default {
  test,
  getUser,
  listFollowingPaginated,
  listFollowersPaginated,
  searchUsers,
  createUser,
  updateUser,
};
