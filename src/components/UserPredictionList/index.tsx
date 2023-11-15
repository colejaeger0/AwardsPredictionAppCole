import React from 'react';
import { TouchableHighlight, useWindowDimensions, View } from 'react-native';
import MovieGrid from '../../components/MovieGrid';
import { Body, Label, SubHeader } from '../../components/Text';
import { AWARDS_BODY_TO_PLURAL_STRING } from '../../constants/awardsBodies';
import COLORS from '../../constants/colors';
import theme from '../../constants/theme';
import { useEvent } from '../../context/EventContext';
import { useAuth } from '../../context/AuthContext';
import { PredictionsParamList } from '../../navigation/types';
import { formatLastUpdated } from '../../util/formatDateTime';
import { useTypedNavigation } from '../../util/hooks';
import { AwardsBody, CategoryName, iRecentPrediction } from '../../types/api';
import useQueryGetAllEvents from '../../hooks/queries/useQueryGetAllEvents';

const UserPredictionList = ({
  predictionSets,
  userId,
}: {
  predictionSets: iRecentPrediction[];
  fixedSlots?: number;
  userId: string;
}) => {
  const { userId: authUserId } = useAuth();
  const navigation = useTypedNavigation<PredictionsParamList>();
  const { data: events } = useQueryGetAllEvents();
  const { setEvent, setCategory } = useEvent();
  const { width } = useWindowDimensions();
  const isAuthProfile = userId === authUserId;

  return (
    <>
      {predictionSets.map((ps) => {
        if (!ps) return null;
        const awardsBodyName = AWARDS_BODY_TO_PLURAL_STRING[ps.awardsBody as AwardsBody];
        const lastUpdatedText = formatLastUpdated(new Date(ps.createdAt));
        const event = events?.find(
          (e) => e.awardsBody === ps.awardsBody && e.year === ps.year,
        );
        return (
          <TouchableHighlight
            key={ps.category + lastUpdatedText}
            style={{
              width,
              alignItems: 'flex-start',
            }}
            underlayColor={COLORS.secondaryDark}
            onPress={() => {
              if (!event) {
                console.error('could not find event');
                return;
              }
              // navigate to user's predictions
              setEvent(event);
              setCategory(ps.category as CategoryName);
              if (isAuthProfile) {
                navigation.navigate('Category', {
                  userId,
                  showEventLink: true,
                });
              } else {
                navigation.navigate('CategoryFromProfile', {
                  userId,
                  showEventLink: true,
                });
              }
            }}
          >
            <>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  paddingLeft: theme.windowMargin,
                  paddingRight: theme.windowMargin,
                  marginBottom: 10,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <SubHeader style={{ color: COLORS.lightest }}>{ps.category}</SubHeader>
                  <Body style={{ color: COLORS.lightest }}>
                    {'  |  ' + awardsBodyName}
                  </Body>
                </View>
                <Label style={{ marginTop: 5 }}>
                  {'Updated' + ': ' + lastUpdatedText}
                </Label>
              </View>
              <MovieGrid
                predictions={ps.topPredictions}
                noLine
                style={{ marginBottom: 0 }}
              />
            </>
          </TouchableHighlight>
        );
      })}
    </>
  );
};

export default UserPredictionList;
