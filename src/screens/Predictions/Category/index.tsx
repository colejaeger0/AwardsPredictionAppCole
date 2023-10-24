import React, { useLayoutEffect } from 'react';
import PredictionTabsNavigator from '../../../navigation/PredictionTabsNavigator';
import CategoryCommunity from './CategoryCommunity';
import CategoryPersonal from './CategoryPersonal';
import { useTypedNavigation } from '../../../util/hooks';
import { PredictionsParamList } from '../../../navigation/types';
import { getAwardsBodyCategories } from '../../../constants/categories';
import { useEvent } from '../../../context/EventContext';
import { eventToString } from '../../../util/stringConversions';
import { getHeaderTitleWithTrophy } from '../../../constants';
import { useAuth } from '../../../context/AuthContext';
import { RouteProp, StackActions, useRoute } from '@react-navigation/native';
import FollowingBottomScroll from '../../../components/FollowingBottomScroll';
import { CategoryName } from '../../../types/api';

export type iCategoryProps = {
  userId: string | undefined;
  showEventLink?: boolean;
};

// Essentially "Category with personal/community tabs" (uses usePredictionData)
const Category = () => {
  const { params } = useRoute<RouteProp<PredictionsParamList, 'Category'>>();
  const { userId: authUserId } = useAuth();
  const userId = params?.userId || authUserId;
  const showEventLink = params?.showEventLink || false;

  const { category, event: _event, isEditing } = useEvent();
  const event = _event!;
  const navigation = useTypedNavigation<PredictionsParamList>();

  // Set the header
  useLayoutEffect(() => {
    if (!category || !event) return;
    const awardsBodyCategories = getAwardsBodyCategories(event.awardsBody, event.year);
    const eventName = eventToString(event.awardsBody, event.year);
    const categoryName = awardsBodyCategories[CategoryName[category]]?.name || '';
    const headerTitle = eventName + '\n' + 'Best ' + categoryName;
    navigation.setOptions({
      headerTitle: getHeaderTitleWithTrophy(headerTitle, event.awardsBody),
    });
  }, [navigation]);

  return (
    <>
      {PredictionTabsNavigator(
        <CategoryPersonal showEventLink={showEventLink && !isEditing} userId={userId} />,
        <CategoryCommunity showEventLink={showEventLink && !isEditing} />,
      )}
      {userId && !isEditing ? (
        <FollowingBottomScroll
          onPress={(id) => {
            navigation.dispatch(StackActions.push('CategoryFromProfile', { userId: id }));
          }}
        />
      ) : null}
    </>
  );
};

export default Category;
