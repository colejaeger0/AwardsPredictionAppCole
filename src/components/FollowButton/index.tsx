import { useNavigation } from '@react-navigation/native';
import { Spinner } from '@ui-kitten/components';
import React, { useState } from 'react';
import { Alert, StyleProp, TouchableHighlight, ViewStyle } from 'react-native';
import COLORS from '../../constants/colors';
import theme from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import useMutationUpdateRelationship from '../../hooks/mutations/useMutationUpdateRelationship';
import { BodyBold } from '../Text';
import { MainScreenNavigationProp } from '../../navigation/types';

const FollowButton = ({
  authUserIsFollowing,
  profileUserId,
  style,
}: {
  authUserIsFollowing: boolean;
  profileUserId: string;
  style?: StyleProp<ViewStyle>;
}) => {
  const { userId: authUserId } = useAuth();
  const navigation = useNavigation<MainScreenNavigationProp>();

  const { mutate: updateRelationship, isComplete } = useMutationUpdateRelationship();

  // just to display the updated value
  const [isFollowing, setIsFollowing] = useState(authUserIsFollowing);

  const isAuthProfile = profileUserId === authUserId;
  if (isAuthProfile) return null;

  return (
    <TouchableHighlight
      style={[
        {
          alignItems: 'center',
          backgroundColor: isFollowing ? COLORS.disabled : COLORS.secondaryDark,
          padding: 10,
          borderRadius: theme.borderRadius,
        },
        style,
      ]}
      onPress={async () => {
        if (!authUserId) {
          navigation.navigate('AuthenticatorNavigator');
        } else if (isFollowing) {
          // warn before they unfollow?
          Alert.alert('Unfollow user?', '', [
            {
              text: 'Cancel',
              onPress: () => {},
              style: 'cancel',
            },
            {
              text: 'Yes',
              onPress: async () => {
                await updateRelationship({
                  action: 'unfollow',
                  profileUserId,
                });
                setIsFollowing(false);
              },
            },
          ]);
        } else {
          if (!authUserId) return;
          await updateRelationship({ action: 'follow', profileUserId });
          setIsFollowing(true);
        }
      }}
      underlayColor={COLORS.secondary}
    >
      {isComplete ? (
        <BodyBold>{isFollowing ? 'Following' : 'Follow'}</BodyBold>
      ) : (
        <Spinner size="medium" style={{ borderColor: COLORS.gray }} />
      )}
    </TouchableHighlight>
  );
};

export default FollowButton;
