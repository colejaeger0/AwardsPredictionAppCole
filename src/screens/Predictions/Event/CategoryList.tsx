import React, { useEffect } from 'react';
import { TouchableHighlight, View } from 'react-native';
import MovieGrid from '../../../components/MovieGrid';
import { HeaderLight, SubHeader } from '../../../components/Text';
import COLORS from '../../../constants/colors';
import theme from '../../../constants/theme';
import { useEvent } from '../../../context/EventContext';
import { getOrderedCategories } from '../../../util/sortByObjectOrder';
import {
  CategoryName,
  PredictionSet,
  WithId,
  iCategoryPrediction,
  iPrediction,
} from '../../../types/api';

type iCategoryListProps = {
  isCollapsed: boolean;
  onSelectCategory: (category: CategoryName) => void;
  predictionData: WithId<PredictionSet> | undefined;
  isAuthUserProfile?: boolean;
};

// Lists all categories in order, and displays predictionData
const CategoryList = ({
  onSelectCategory,
  predictionData,
  isAuthUserProfile,
}: iCategoryListProps) => {
  const { event, reset } = useEvent();
  const unorderedCategories = (predictionData?.categories || {}) as Record<
    CategoryName,
    iCategoryPrediction
  >;
  const awardsBodyCategories = event?.categories;
  const orderedPredictions = event
    ? getOrderedCategories(event.awardsBody, event.year, unorderedCategories)
    : [];

  // reset category context when changing events
  useEffect(() => {
    reset();
  }, []);

  // filter out categories that are hidden until shortlisted
  const categoryRows: React.JSX.Element[] = [];
  for (const [categoryName, catPredictions] of orderedPredictions) {
    if (!awardsBodyCategories) continue;
    // get category info
    const { isHidden, name, slots } = awardsBodyCategories[categoryName];
    // hide hidden categories (like shorts)
    if (isHidden) continue;
    const predictions = catPredictions.predictions.sort((p1, p2) =>
      p1.ranking > p2.ranking ? 1 : -1,
    );
    // once nominations happen, you want "slots" to be however many films are nominated
    const truncatedPredictions: iPrediction[] = predictions.slice(0, slots || 5);

    const CategoryRow = (
      <TouchableHighlight
        key={categoryName}
        style={{
          width: '100%',
          alignItems: 'flex-start',
        }}
        underlayColor={COLORS.secondaryDark}
        onPress={() => onSelectCategory(categoryName)}
      >
        <View>
          <SubHeader
            style={{
              color: COLORS.lightest,
              marginLeft: theme.windowMargin,
              marginBottom: 5,
              marginTop: 5,
            }}
          >
            {name}
          </SubHeader>
          {truncatedPredictions.length === 0 ? (
            <HeaderLight style={{ marginLeft: theme.windowMargin }}>
              {!isAuthUserProfile ? 'No Predictions' : 'Add Predictions'}
            </HeaderLight>
          ) : null}
          <MovieGrid
            predictions={truncatedPredictions}
            categoryInfo={awardsBodyCategories[categoryName]}
            noLine
          />
        </View>
      </TouchableHighlight>
    );
    categoryRows.push(CategoryRow);
  }

  return categoryRows;
};

export default CategoryList;
