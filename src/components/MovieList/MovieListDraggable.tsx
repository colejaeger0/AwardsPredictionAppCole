import { Divider } from '@ui-kitten/components';
import React, { useCallback, useState } from 'react';
import { TouchableHighlight, View } from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { CATEGORY_TYPE_TO_STRING } from '../../constants/categories';
import COLORS from '../../constants/colors';
import theme from '../../constants/theme';
import LastUpdatedText from '../LastUpdatedText';
import ContenderListItem from '../List/ContenderList/ContenderListItem';
import { Body, SubHeader } from '../Text';
import { iPrediction } from '../../types/api';
import { triggerHaptic } from '../../util/hapticFeedback';
import { useNavigation } from '@react-navigation/native';
import { PredictionsNavigationProp } from '../../navigation/types';
import { useRouteParams } from '../../hooks/useRouteParams';
import useQueryGetEventAccolades from '../../hooks/queries/useQueryGetEventAccolades';

type iMovieListProps = {
  predictions: iPrediction[];
  setPredictions: (ps: iPrediction[]) => void;
  lastUpdatedString: string;
  isAuthProfile?: boolean;
  onPressAdd: () => void;
};

const MovieListDraggable = ({
  predictions,
  setPredictions,
  lastUpdatedString,
  isAuthProfile,
  onPressAdd,
}: iMovieListProps) => {
  const navigation = useNavigation<PredictionsNavigationProp>();
  const {
    categoryData,
    category: _category,
    eventId: _eventId,
    yyyymmdd,
  } = useRouteParams();
  const category = _category!;
  const eventId = _eventId!;

  const { data: contenderIdsToPhase } = useQueryGetEventAccolades(eventId);

  const { slots: _slots, type } = categoryData!;
  const slots = _slots ?? 5;

  const [itemsToDelete, setItemsToDelete] = useState<iPrediction[]>([]);

  const onPressItem = useCallback(async (prediction: iPrediction) => {
    navigation.navigate('ContenderInfoModal', { prediction, category, eventId });
  }, []);

  const toggleDeleteMode = useCallback((prediction: iPrediction) => {
    triggerHaptic();
    setItemsToDelete((curr) => {
      const newItems = [...curr];
      const index = curr.findIndex((p) => p.contenderId === prediction.contenderId);
      if (index === -1) {
        newItems.push(prediction);
      } else {
        newItems.splice(index, 1);
      }
      return newItems;
    });
  }, []);

  const showAccolades = !!yyyymmdd;

  return (
    <DraggableFlatList
      data={predictions}
      keyExtractor={(item) => item.contenderId}
      style={{ width: '100%' }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 150,
      }}
      onPlaceholderIndexChange={() => {
        triggerHaptic();
      }}
      ListHeaderComponent={<LastUpdatedText lastUpdated={lastUpdatedString} />}
      ListFooterComponent={
        isAuthProfile && predictions.length === 0 ? (
          <View style={{ width: '100%', alignItems: 'center', marginTop: 40 }}>
            <TouchableHighlight
              style={{
                width: '90%',
                maxWidth: 400,
                borderRadius: theme.borderRadius,
                borderWidth: 1,
                borderColor: COLORS.white,
                alignItems: 'center',
                justifyContent: 'center',
                padding: 10,
              }}
              underlayColor={COLORS.secondaryDark}
              onPress={onPressAdd}
            >
              <SubHeader>{`+ Add ${CATEGORY_TYPE_TO_STRING[type]}s`}</SubHeader>
            </TouchableHighlight>
          </View>
        ) : isAuthProfile && predictions.length > 0 ? (
          <Body
            style={{
              color: COLORS.gray,
              width: '100%',
              marginTop: 20,
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {'To delete, press + hold'}
          </Body>
        ) : null
      }
      renderItem={({ item: prediction, getIndex, drag, isActive }) => {
        const index = getIndex() || 0;
        const ranking = index + 1;
        const isSelectedForDelete = itemsToDelete.some(
          (p) => p.contenderId === prediction.contenderId,
        );
        const accoladeToShow = showAccolades
          ? contenderIdsToPhase && contenderIdsToPhase[prediction.contenderId]
          : undefined;

        return (
          <>
            {index === slots ? (
              <Divider
                style={{
                  margin: 10,
                  backgroundColor: isActive ? 'transparent' : COLORS.secondary,
                }}
              />
            ) : null}
            <ScaleDecorator activeScale={1}>
              <ContenderListItem
                prediction={prediction}
                ranking={ranking}
                onPressItem={() => {
                  if (itemsToDelete.includes(prediction)) {
                    toggleDeleteMode(prediction);
                  } else {
                    onPressItem(prediction);
                  }
                }}
                onLongPress={
                  isAuthProfile
                    ? () => {
                        toggleDeleteMode(prediction);
                      }
                    : undefined
                }
                draggable={{
                  drag,
                  isActive,
                }}
                categoryType={type}
                iconRightProps={
                  !isAuthProfile
                    ? undefined
                    : isSelectedForDelete
                    ? {
                        iconName: 'trash-outline',
                        backgroundColor: COLORS.error,
                        onPress: () => {
                          triggerHaptic();
                          setPredictions(
                            predictions.filter(
                              (p) => p.contenderId !== prediction.contenderId,
                            ),
                          );
                          setItemsToDelete((curr) =>
                            curr.filter((p) => p.contenderId !== prediction.contenderId),
                          );
                        },
                      }
                    : {
                        iconName: 'menu',
                        enableOnPressIn: true,
                        onPress: () => drag(),
                      }
                }
                accolade={accoladeToShow ?? undefined}
              />
            </ScaleDecorator>
          </>
        );
      }}
      onDragEnd={({ data }) => {
        setPredictions(data);
      }}
    />
  );
};

export default MovieListDraggable;
