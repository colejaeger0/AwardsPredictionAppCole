import React, { useEffect } from 'react';
import { Animated, useWindowDimensions } from 'react-native';
import LoadingStatue from '../../../components/LoadingStatue';
import BackgroundWrapper from '../../../components/BackgroundWrapper';
import useQueryAllEvents from '../../../hooks/queries/getAllEvents';
import { useAuth } from '../../../context/UserContext';
import useQueryGetUser from '../../../hooks/queries/getUser';
import EventList from '../Event/EventList';
import { HeaderLight } from '../../../components/Text';
import useQueryGetFollowingRecentPredictions from '../../../hooks/queries/useQueryGetFollowingRecentPredictions';
import PredictionCarousel from '../../../components/PredictionCarousel';
import { useLoading } from '../../../hooks/animatedState/useLoading';
import theme from '../../../constants/theme';
import RecommendedUsers from '../../../components/RecommendedUsers';

const EventSelect = () => {
  const { width } = useWindowDimensions();
  const { userId: authUserId } = useAuth();

  const { data: events, isLoading, refetch: refetchEvents } = useQueryAllEvents();
  const { data: user, refetch: refetchUser } = useQueryGetUser(authUserId);
  const { data: usersWithRecentPredictionSets, refetch: refetchFollowingPredictions } =
    useQueryGetFollowingRecentPredictions(user);

  const { loadingOpacity, bodyOpacity } = useLoading(isLoading);

  useEffect(() => {
    if (authUserId && user === undefined) {
      refetchUser();
    }
    if (authUserId) {
      // WARN: sometimes refetch appears to be not working, but mostly it seems ok?
      refetchFollowingPredictions();
    }
  }, [authUserId, user]);

  // just in case there's some refresh problem
  useEffect(() => {
    if (events === undefined) {
      refetchEvents();
    }
  }, [events]);

  return (
    <BackgroundWrapper>
      <>
        <Animated.View
          style={{
            position: 'absolute',
            height: '80%',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: loadingOpacity,
          }}
        >
          <LoadingStatue />
        </Animated.View>
        <Animated.ScrollView
          style={{ opacity: bodyOpacity }}
          contentContainerStyle={{
            alignItems: 'center',
            width,
            paddingBottom: 100,
          }}
          showsVerticalScrollIndicator={false}
        >
          <HeaderLight
            style={{
              alignSelf: 'flex-start',
              marginTop: 20,
              marginLeft: theme.windowMargin,
            }}
          >
            Make Predictions
          </HeaderLight>
          {events ? (
            <EventList
              user={user} // so if the user is signed out they don't see their old predictions
              events={events}
            />
          ) : null}
          {!authUserId ? (
            // users not signed in can see recommended users
            <RecommendedUsers header={'Follow Users'} />
          ) : usersWithRecentPredictionSets ? (
            <>
              <HeaderLight
                style={{
                  alignSelf: 'flex-start',
                  marginTop: 20,
                  marginLeft: theme.windowMargin,
                  marginBottom: 10,
                }}
              >
                New From Friends
              </HeaderLight>
              {usersWithRecentPredictionSets.map((u) => (
                <PredictionCarousel
                  key={u.id}
                  predictionSets={u.predictionSets || []}
                  userId={u.id}
                  userInfo={{
                    name: u.name || u.username || '',
                    image: u.image,
                  }}
                />
              ))}
            </>
          ) : null}
        </Animated.ScrollView>
      </>
    </BackgroundWrapper>
  );
};

export default EventSelect;
