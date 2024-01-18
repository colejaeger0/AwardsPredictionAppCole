import _ from 'lodash';
import React from 'react';
import { View } from 'react-native';
import COLORS from '../../../constants/colors';
import { PredictionsNavigationProp } from '../../../navigation/types';
import { getOrderedEvents } from '../../../util/sortByObjectOrder';
import { usePersonalCommunityTab } from '../../../context/EventContext';
import {
  EVENT_STATUS_TO_STRING,
  EVENT_STATUS_TO_STRING_SHORT,
  getEventTime,
} from '../../../constants/events';
import { Divider } from '@ui-kitten/components';
import { EventModel, EventStatus, User, UserRole, WithId } from '../../../types/api';
import EventItem from '../../../components/EventItem';
import { AWARDS_BODY_TO_PLURAL_STRING } from '../../../constants/awardsBodies';
import { useNavigation } from '@react-navigation/native';
import { getUserInfo } from '../../../util/getUserInfo';

const EventList = ({
  events,
  user,
  isProfile,
}: {
  events: WithId<EventModel>[];
  user: WithId<User> | undefined;
  isProfile?: boolean;
}) => {
  const { setPersonalCommunityTab } = usePersonalCommunityTab();
  const navigation = useNavigation<PredictionsNavigationProp>();

  const userId = user?._id;

  const onSelectEvent = async (event: WithId<EventModel>) => {
    setPersonalCommunityTab(userId ? 'personal' : 'community');
    const params = {
      userInfo: getUserInfo(user),
      eventId: event._id,
    };
    navigation.navigate('Event', params);
  };

  const orderedEvents = getOrderedEvents(events);
  const groupedByYear = _.groupBy(orderedEvents, (e: WithId<EventModel>) => e.year);

  const userIsAdminOrTester = user
    ? user.role === UserRole.ADMIN || user.role === UserRole.TESTER
    : false;

  return (
    <>
      {Object.entries(groupedByYear)
        // sort by year
        .sort(([yearA], [yearB]) => (parseInt(yearA, 10) > parseInt(yearB, 10) ? -1 : 1))
        .map(([year, events], i) => (
          <View key={year} style={{ width: '100%' }}>
            <View style={{ flexDirection: 'column' }}>
              {i > 0 ? (
                <Divider
                  style={{
                    width: '100%',
                    marginTop: 20,
                    marginBottom: 30,
                    backgroundColor: COLORS.white,
                    opacity: 0.3,
                  }}
                />
              ) : (
                <View style={{ marginTop: 20 }} />
              )}
            </View>
            <View
              style={{
                flexWrap: 'wrap',
                flexDirection: 'row',
              }}
            >
              {events.map((event) => {
                const { status, awardsBody } = event;
                const eventIsAdminOnly = status === EventStatus.NOMS_STAGING;
                if (eventIsAdminOnly && !userIsAdminOrTester) return null; // don't display events with status NOMS_STAGING to non-admin
                const closeTime = getEventTime(event);
                return (
                  <EventItem
                    subtitle={year + ' ' + AWARDS_BODY_TO_PLURAL_STRING[awardsBody]}
                    title={
                      isProfile
                        ? `${EVENT_STATUS_TO_STRING_SHORT[status]}`
                        : `${EVENT_STATUS_TO_STRING[status]}`
                    }
                    onPress={() => onSelectEvent(event)}
                    mode={isProfile ? 'transparent' : 'solid'}
                    bottomRightText={closeTime === '' ? '' : `Closes ${closeTime}`}
                  />
                );
              })}
            </View>
          </View>
        ))}
    </>
  );
};

export default EventList;
