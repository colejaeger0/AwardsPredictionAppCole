import React, { useState } from 'react';
import { TouchableHighlight, TouchableOpacity, View } from 'react-native';
import COLORS from '../../../constants/colors';
import { Body, SubHeader } from '../../../components/Text';
import { formatDecimalAsPercentage } from '../../../util/formatPercentage';
import Stat from '../../../components/ItemStatBox/Stat';
import ProfileImage from '../../../components/ProfileImage';
import { LEADERBOARD_PROFILE_IMAGE_SIZE } from '../../../components/LeaderboardListItem';

const LeaderboardStats = ({
  title,
  subtitle,
  userImage,
  percentageAccuracy,
  numCorrect,
  totalPossibleSlots,
  numUsersPredicting,
  rank,
  riskiness,
  onPress,
}: {
  title?: string;
  subtitle?: string;
  userImage?: string;
  percentageAccuracy: number;
  numCorrect: number;
  totalPossibleSlots: number;
  numUsersPredicting: number;
  rank: number;
  riskiness?: number;
  onPress?: () => void;
}) => {
  const statsOnTwoRows = riskiness;

  const [showPointsInfo, setShowPointsInfo] = useState<boolean>(false);

  return (
    <TouchableHighlight
      style={{
        flexDirection: 'row',
        width: '100%',
      }}
      onPress={onPress}
      underlayColor={COLORS.secondaryDark}
    >
      <View
        style={{
          flexDirection: 'column',
          width: '100%',
          justifyContent: 'space-between',
          alignItems: 'center',
          flex: 1,
        }}
      >
        {title ? (
          <View
            style={{
              flexDirection: 'column',
              padding: 20,
              alignItems: 'center',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {userImage ? (
                <ProfileImage
                  image={userImage}
                  imageSize={LEADERBOARD_PROFILE_IMAGE_SIZE}
                  onPress={() => {}}
                  style={{ marginRight: 10 }}
                />
              ) : null}
              <SubHeader>{title}</SubHeader>
            </View>
            {subtitle ? <Body style={{ marginTop: 5 }}>{subtitle}</Body> : null}
          </View>
        ) : (
          <View style={{ padding: 15 }} />
        )}
        <View
          style={{
            flexDirection: statsOnTwoRows ? 'column' : 'row',
            width: '100%',
            justifyContent: 'space-around',
            alignItems: 'flex-end',
            flex: 1,
          }}
        >
          <View style={{ flex: 2, flexDirection: 'row' }}>
            <Stat number={`#${rank}`} text={`of ${numUsersPredicting} users`} />
            <Stat number={`${numCorrect}/${totalPossibleSlots}`} text="correct" />
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              marginTop: statsOnTwoRows ? 20 : 0,
              overflow: 'visible',
            }}
          >
            <Stat
              number={`${formatDecimalAsPercentage(percentageAccuracy)}%`}
              text="accuracy"
            />
            {riskiness ? (
              <TouchableOpacity
                onPress={() => setShowPointsInfo((prev) => !prev)}
                style={{ alignItems: 'center', flex: 1 }}
              >
                {showPointsInfo ? (
                  <Body style={{ padding: 10, textAlign: 'center' }}>
                    {
                      'Earned for accurate predix against the grain.\ne.g. if 90% of users did NOT predict, you get 90/100pts'
                    }
                  </Body>
                ) : (
                  <>
                    {riskiness ? (
                      <Stat
                        number={`${parseFloat(riskiness.toString()).toFixed(0)}pts`}
                        text={'points'}
                      />
                    ) : null}
                  </>
                )}
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
        <View
          style={{
            height: 0.5,
            width: '90%',
            backgroundColor: COLORS.primaryLight,
            marginTop: 30,
            marginBottom: 5,
          }}
        />
      </View>
    </TouchableHighlight>
  );
};

export default LeaderboardStats;
