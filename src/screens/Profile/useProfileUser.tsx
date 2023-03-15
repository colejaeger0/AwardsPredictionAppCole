import { useEffect, useState } from 'react';
import { useAuth } from '../../context/UserContext';
import useQueryGetRelationshipCount from '../../hooks/queries/useQueryGetRelationshipCount';
import useQueryGetUserProfile from '../../hooks/queries/useQueryGetUserProfile';
import getRelationshipCount from '../../services/queryFuncs/getRelationshipCount';
import getUserEvents from '../../services/queryFuncs/getUserEvents';
import getUserProfile from '../../services/queryFuncs/getUserProfile';
import { iUser } from '../../types';

const useProfileUser = (userId: string | undefined) => {
  const { userId: authUserId } = useAuth();

  const [isLoadingProfileUser, setIsLoading] = useState<boolean>(true);
  const [profileUser, setUser] = useState<iUser | undefined>(undefined);
  const [followingCount, setFollowingCount] = useState<number | undefined>(undefined);
  const [followerCount, setFollowerCount] = useState<number | undefined>(undefined);
  const [userEventIds, setUserEventIds] = useState<string[]>([]);

  // The following queries fetch auth profile separately
  // allows avoiding refetch every time it's focused, instead updating from query keys
  // We shouldn't do this for other users' profiles though bc query keys can't expire their data, has to be fetched onFocus every time
  const { data: authUser, isLoading: isLoadingAuthUser } = useQueryGetUserProfile(
    authUserId,
    authUserId,
  );
  const { data: authRelationshipCountData } = useQueryGetRelationshipCount(authUserId);

  const isLoading = isLoadingAuthUser || isLoadingProfileUser;

  const isDeviceProfile = profileUser && userId && profileUser?.id === authUserId;

  // we have to do this and NOT useQuery because Profile component is re-used
  // and we have to refresh component whenever a new user profile is loaded
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    // get user profile info
    getUserProfile(userId, authUserId)
      .then((res) => setUser(res))
      .finally(() => setIsLoading(false));
    // get follower / following count
    getRelationshipCount(userId).then(({ followingCount, followerCount }) => {
      setFollowingCount(followingCount);
      setFollowerCount(followerCount);
    });
    // get events user has predicted
    getUserEvents(userId).then((eventIds) => setUserEventIds(eventIds));
  }, [userId]);

  const user = profileUser;
  // Should use the authUser's data from useQuery hook because this info can change and it will never be stale
  if (user && isDeviceProfile) {
    user.username = authUser?.username;
    user.bio = authUser?.bio;
    user.image = authUser?.image;
    user.name = authUser?.name;
  }

  const _followingCount = isDeviceProfile
    ? authRelationshipCountData?.followingCount || 0
    : followingCount || 0;
  const _followerCount = isDeviceProfile
    ? authRelationshipCountData?.followerCount || 0
    : followerCount || 0;

  const _user = isDeviceProfile ? authUser : profileUser;

  return {
    isLoading,
    setIsLoading,
    user: _user,
    followingCount: _followingCount,
    followerCount: _followerCount,
    userEventIds,
    authUser,
  };
};

export default useProfileUser;
