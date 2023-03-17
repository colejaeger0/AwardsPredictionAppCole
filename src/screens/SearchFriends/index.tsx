import React from 'react';
import {
  Keyboard,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import BackgroundWrapper from '../../components/BackgroundWrapper';
import SearchInput from '../../components/Inputs/SearchInput';
import { HeaderLight } from '../../components/Text';
import UserSearchResult from '../../components/UserSearchResult';
import theme from '../../constants/theme';
import { SearchProvider, useSearch } from '../../context/ContenderSearchContext';
import useRecommendedUsers from '../../hooks/useRecommendedUsers';
import useFriendSearch from './useFriendSearch';

const SearchFriends = () => {
  const { width } = useWindowDimensions();

  const { isSearching } = useSearch();
  const { searchResults } = useFriendSearch();
  const { users: recommendedUsers, fetchPage } = useRecommendedUsers();

  return (
    <BackgroundWrapper>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View
          style={{
            width: '100%',
            height: '100%',
            alignItems: 'center',
          }}
        >
          <SearchInput
            placeholder={'Search users'}
            style={{ width, padding: theme.windowMargin }}
          />
          {!isSearching && searchResults.length === 0 ? (
            recommendedUsers.length > 0 ? (
              <>
                <HeaderLight
                  style={{
                    marginTop: 40,
                    alignSelf: 'flex-start',
                    marginLeft: theme.windowMargin,
                  }}
                >
                  Recommended:
                </HeaderLight>
                <UserSearchResult users={recommendedUsers} onEndReached={fetchPage} />
              </>
            ) : null
          ) : (
            <UserSearchResult users={searchResults} />
          )}
        </View>
      </TouchableWithoutFeedback>
    </BackgroundWrapper>
  );
};

const WithProvider = () => (
  <SearchProvider>
    <SearchFriends />
  </SearchProvider>
);

export default WithProvider;
