import { Divider } from '@ui-kitten/components';
import React, { useState } from 'react';
import { Animated, FlatList, View } from 'react-native';
import { PredictionType } from '../../API';
import { getCategorySlots } from '../../constants/categories';
import COLORS from '../../constants/colors';
import theme from '../../constants/theme';
import { useCategory } from '../../context/CategoryContext';
import { iCategory, iEvent, iPrediction } from '../../types';
import LastUpdatedText from '../LastUpdatedText';
import ContenderListItem, {
  iContenderListItemProps,
} from '../List/ContenderList/ContenderListItem';
import ContenderListItemCondensed from '../List/ContenderList/ContenderListItemCondensed';
import { BodyBold } from '../Text';

type iMovieListProps = {
  predictions: iPrediction[];
  lastUpdatedString: string;
  isCollapsed?: boolean;
  disableHeader?: boolean;
};

const MovieListCommunity = ({
  predictions,
  isCollapsed,
  lastUpdatedString,
  disableHeader,
}: iMovieListProps) => {
  const { event: _event, category: _category, date } = useCategory();
  const isHistory = !!date;

  const event = _event as iEvent;
  const category = _category as iCategory;

  const [selectedContenderId, setSelectedContenderId] = useState<string | undefined>(); // this selection is whether the film is big or not

  const predictionType = predictions[0]?.predictionType || PredictionType.NOMINATION;
  const slots = getCategorySlots(event, category.name, predictionType);

  return (
    <FlatList
      data={predictions}
      keyExtractor={(item) => item.contenderId}
      style={{ width: '100%' }}
      contentContainerStyle={{ paddingBottom: 100 }}
      ListHeaderComponent={
        <>
          <LastUpdatedText lastUpdated={lastUpdatedString} isDisabled={isHistory} />
          {predictions.length > 0 ? (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                padding: theme.windowMargin,
                paddingTop: disableHeader ? 0 : undefined,
              }}
            >
              <View style={{ flexDirection: 'row' }} />
              {!disableHeader ? (
                <Animated.View
                  style={{
                    flexDirection: 'row',
                    width: 120,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  {predictionType === PredictionType.WIN ? (
                    <View />
                  ) : (
                    <View>
                      <BodyBold style={{ textAlign: 'right' }}>Predict</BodyBold>
                      <BodyBold style={{ textAlign: 'right' }}>Nom</BodyBold>
                    </View>
                  )}
                  <View>
                    <BodyBold style={{ textAlign: 'right' }}>Predict</BodyBold>
                    <BodyBold style={{ textAlign: 'right' }}>Win</BodyBold>
                  </View>
                </Animated.View>
              ) : null}
            </View>
          ) : null}
        </>
      }
      renderItem={({ item: prediction, index }) => {
        const ranking = index + 1;
        const onPressItem = async (prediction: iPrediction) => {
          if (isCollapsed) return; // do nothing if is collapsed
          const id = prediction.contenderId;
          if (selectedContenderId === id) {
            setSelectedContenderId(undefined);
          } else {
            setSelectedContenderId(id);
          }
        };
        const listItemProps: iContenderListItemProps = {
          variant: 'community',
          prediction,
          ranking,
          isSelected: selectedContenderId === prediction.contenderId,
          onPressItem,
          onPressThumbnail: onPressItem,
          categoryType: category.type,
        };
        return (
          <>
            {index === slots ? (
              <Divider
                style={{
                  margin: 10,
                  borderWidth: 0.5,
                  borderColor: COLORS.secondary,
                }}
              />
            ) : null}
            {!isCollapsed ? (
              <ContenderListItem {...listItemProps} />
            ) : (
              <ContenderListItemCondensed {...listItemProps} />
            )}
          </>
        );
      }}
    />
  );
};

export default MovieListCommunity;
