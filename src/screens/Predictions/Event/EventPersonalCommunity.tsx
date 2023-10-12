import React from 'react';
import { PredictionsParamList } from '../../../navigation/types';
import PredictionTabsNavigator from '../../../navigation/PredictionTabsNavigator';
import { useAuth } from '../../../context/AuthContext';
import {
  RouteProp,
  StackActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import Event from './index';
import FollowingBottomScroll from '../../../components/FollowingBottomScroll';
import useQueryGetUserPredictions from '../../../hooks/queries/useQueryGetUserPredictions';
import useQueryGetCommunityPredictions from '../../../hooks/queries/useQueryGetCommunityPredictions';

const EventPersonalCommunity = () => {
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<PredictionsParamList, 'Event'>>();

  const { userId: authUserId } = useAuth();
  const userId = params?.userId || authUserId || '';

  const { data: personalPredictionData, isLoading: isLoadingPersonal } =
    useQueryGetUserPredictions(userId);
  const { data: communityPredictionData, isLoading: isLoadingCommunity } =
    useQueryGetCommunityPredictions();

  return (
    <>
      {PredictionTabsNavigator(
        <Event
          tab={'personal'}
          predictionData={personalPredictionData ?? undefined}
          isLoading={isLoadingPersonal}
          userId={userId}
        />,
        <Event
          tab={'community'}
          predictionData={communityPredictionData}
          isLoading={isLoadingCommunity}
          userId={userId}
        />,
      )}
      {authUserId ? (
        <FollowingBottomScroll
          onPress={(id) => {
            navigation.dispatch(StackActions.push('EventFromProfile', { userId: id }));
          }}
        />
      ) : null}
    </>
  );
};

export default EventPersonalCommunity;
