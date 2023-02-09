import React, { useLayoutEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Snackbar from '../../components/Snackbar';
import { useNavigation } from '@react-navigation/native';
import FormInput from '../../components/Inputs/FormInput';
import { EvaStatus } from '@ui-kitten/components/devsupport/typings';
import { SubmitButton } from '../../components/Buttons';
import { useAuth } from '../../context/UserContext';
import { getHeaderTitle } from '../../constants';
import BackgroundWrapper from '../../components/BackgroundWrapper';
import { BodyBold } from '../../components/Text';
import useUpdateUser from '../../hooks/mutations/updateUser';
import useQueryGetUser from '../../hooks/queries/getUser';

const ChangeUsername = () => {
  const { userId } = useAuth();
  const navigation = useNavigation();

  const { data: user } = useQueryGetUser(userId);
  const { mutate: updateUser, isComplete } = useUpdateUser(() => {
    Snackbar.success('Username updated');
    navigation.goBack();
  });

  const [name, setName] = useState<string>(user?.name || '');
  const [username, setUsername] = useState<string>(user?.username || '');
  const [usernameStatus, setUsernameStatus] = useState<EvaStatus | undefined>(undefined);

  const validName = name.length >= 0;
  const validUsername = username.length >= 8;
  const nameBeforeEdit = user?.name || '';
  const usernameBeforeEdit = user?.username || '';
  const enableSubmitUsername = usernameBeforeEdit !== username && validUsername;
  const enableSubmitName = nameBeforeEdit !== name && validName;

  const submitEnabled = enableSubmitUsername || enableSubmitName;

  useLayoutEffect(() => {
    // This is the best way to change the header
    navigation.setOptions({
      headerTitle: getHeaderTitle(
        usernameBeforeEdit ? 'Update Username' : 'Create Username',
      ),
    });
  }, [usernameBeforeEdit, navigation]);

  const updateUsername = async () => {
    const un = enableSubmitUsername ? username : undefined;
    const n = enableSubmitName ? name : undefined;
    if (!user?.id) return;
    updateUser({ id: user?.id, username: un, name: n });
  };

  return (
    <BackgroundWrapper>
      <ScrollView
        style={{ width: '100%' }}
        contentContainerStyle={{ alignItems: 'center', marginTop: 40 }}
      >
        <View style={{ width: '80%' }}>
          <FormInput
            label={'Name'}
            value={name}
            setValue={setName}
            textContentType="name"
          />
          <FormInput
            label={'Username'}
            value={username}
            setValue={setUsername}
            caption={
              usernameStatus === 'danger'
                ? 'Must contain at least 8 characters. \nOnly lowercase letters, numbers, underscores, and periods.'
                : 'Only lowercase letters, numbers, underscores, and periods.'
            }
            textContentType="username"
            status={usernameStatus}
            onBlur={() => {
              if (username.length > 0 && !validUsername) {
                setUsernameStatus('danger');
              } else {
                setUsernameStatus(undefined);
              }
            }}
          />
          {usernameBeforeEdit ? null : (
            <BodyBold style={{ textAlign: 'center', marginBottom: 20 }}>
              {'You MUST create a username \n so other users can find you'}
            </BodyBold>
          )}
          <SubmitButton
            text={usernameBeforeEdit ? 'Update' : 'Create'}
            onPress={updateUsername}
            disabled={!submitEnabled}
            loading={!isComplete}
          />
        </View>
      </ScrollView>
    </BackgroundWrapper>
  );
};

export default ChangeUsername;
