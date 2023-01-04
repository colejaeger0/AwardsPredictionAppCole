import { Divider } from '@ui-kitten/components';
import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import { getCategorySlots } from '../../constants/categories';
import COLORS from '../../constants/colors';
import theme from '../../constants/theme';
import { useCategory } from '../../context/CategoryContext';
import { iPrediction } from '../../types';
import PosterFromTmdbId from '../Images/PosterFromTmdbId';

const MovieGrid = (props: { predictions: iPrediction[]; noLine?: boolean }) => {
  const { predictions, noLine } = props;
  const { width } = useWindowDimensions();
  const { event, category } = useCategory();

  const slots =
    category && event
      ? getCategorySlots(event.year, event?.awardsBody, category.name)
      : undefined;

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginLeft: theme.windowMargin - theme.posterMargin / 2,
        marginRight: theme.windowMargin - theme.posterMargin / 2,
        marginBottom: theme.windowMargin,
        width: '100%',
      }}
    >
      {predictions.map((p, i) => (
        <View key={p.contenderId}>
          {!noLine && i === slots ? (
            <Divider
              style={{
                position: 'absolute',
                width: width - theme.windowMargin * 2,
                marginTop: 10,
                marginBottom: 10,
                borderBottomWidth: 1,
                borderColor: COLORS.secondary,
              }}
            />
          ) : null}
          {p.contenderMovie ? (
            <>
              {!noLine && slots && i >= slots && i < slots + 5 ? (
                // we want to give a margin on top if this is the row beneath the divider (since divider is absolute pos)
                <View style={{ marginTop: 20 }} />
              ) : null}
              <PosterFromTmdbId
                movieTmdbId={p.contenderMovie.tmdbId}
                personTmdbId={p.contenderPerson?.tmdbId}
                width={(width - theme.windowMargin * 2 + theme.posterMargin) / 5}
                ranking={i + 1}
              />
            </>
          ) : null}
        </View>
      ))}
    </View>
  );
};

export default MovieGrid;
