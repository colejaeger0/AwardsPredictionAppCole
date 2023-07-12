import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserRole } from '../API';
import JwtService, { iJwtPayload } from '../services/jwt';
import ApiServices from '../services/graphql';
import KeychainStorage from '../services/keychain';
import KeychainEventEmitter from '../util/keychainEventEmitter';
import { useNavigation } from '@react-navigation/native';
import { MainScreenNavigationProp } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStorageKeys } from '../types';
import { useAsyncEffect } from '../util/hooks';
import { resetToProfile } from '../util/navigationActions';
import AMPLIFY_CONFIG from '../../amplify/.config/local-env-info.json';

/** Async Storage Functions (to persist data when user closes app)
 * We're not exporting the async functions because we ONLY want to use them in here, or else syncing persisted state with this context is annoying
 * The purpose of this is to keep this context in sync with the async storage for the user's login info
 */

/**
 * Lets us get the userId and userEmail synchronously
 */

type iVerificationCode =
  | {
      code: string;
      expTime: Date;
    }
  | undefined;

type iUserContext = {
  userId: string | undefined;
  userEmail: string | undefined;
  userRole: UserRole | undefined;
  signInUser: (id: string, email: string, role: UserRole) => void;
  signOutUser: () => void;
  verificationCode: iVerificationCode;
  generateVerificationCode: () => string | undefined;
  validateVerificationCode: (c: string) => void;
  isLoadingAuth: boolean;
  isNewUser: boolean;
  amplifyEnv: 'dev' | 'prod';
};

const UserContext = createContext<iUserContext>({
  userId: undefined,
  userEmail: undefined,
  userRole: undefined,
  signInUser: () => {},
  signOutUser: () => {},
  verificationCode: undefined,
  generateVerificationCode: () => undefined,
  validateVerificationCode: () => ({ isValid: false }),
  isLoadingAuth: false,
  isNewUser: true,
  amplifyEnv: 'prod', // important that it defaults to prod just in case
});

// wraps the main navigator so pretty top level
export const UserProvider = (props: { children: React.ReactNode }) => {
  const navigation = useNavigation<MainScreenNavigationProp>();

  const [userInfo, setUserInfo] = useState<iJwtPayload | undefined>(undefined);
  const [verificationCode, setVerificationCode] = useState<iVerificationCode>(undefined);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [amplifyEnv] = useState<'dev' | 'prod'>(
    AMPLIFY_CONFIG.envName === 'dev' ? 'dev' : 'prod',
  );

  // On initial load, checks if user is new
  useAsyncEffect(async () => {
    const isNotFirstTime = await AsyncStorage.getItem(AsyncStorageKeys.IS_NOT_FIRST_TIME);
    setIsNewUser(isNotFirstTime !== 'true');
  }, []);

  // On initial load, OR when keychain/token is set, populates user info to context
  // attaches event listener that fires whenever KeychainStorage is modified
  useEffect(() => {
    const callback = async () => {
      console.log('keychain event emitter fired');
      const { data: payload } = await KeychainStorage.get();
      const { accessToken, refreshToken } = payload || {};
      // sign out the user if there's no payload / no tokens stored in keychain
      if (!accessToken || !refreshToken) {
        console.log('no tokens in keychain');
        return signOutUser();
      }
      // else, read the token & set user info
      const { data } = await JwtService.verifyOrRefresh(accessToken, refreshToken);
      if (!data) {
        return signOutUser();
      }
      const userInfo = data.payload;
      setUserInfo(userInfo);
    };

    // attach event listener
    KeychainEventEmitter.listen(callback);

    // on initial load we want to get the user data from the keychain/token
    KeychainEventEmitter.emit();

    return () => {
      KeychainEventEmitter.remove();
    };
  }, []);

  // creates the access+refresh tokens and stores them in keychain
  const signInUser = async (userId: string, email: string, role: UserRole) => {
    setIsLoadingAuth(true);
    const payload: iJwtPayload = { userId, email, role };
    // CREATE ACCESS TOKEN
    const newAccessToken = JwtService.createAccessToken(payload);
    // CREATE REFRESH TOKEN
    const newRefreshToken = JwtService.createRefreshToken(payload);
    if (newAccessToken && newRefreshToken) {
      // SET USER INFO
      setUserInfo(payload);
      // SET IN KEYCHAIN
      await KeychainStorage.set(newAccessToken, newRefreshToken);
      // SET REFRESH TOKEN IN DB
      if (newRefreshToken) {
        await ApiServices.createRefreshToken(newRefreshToken, userId);
      }
      // NAVIGATE TO PROFILE
      navigation.dispatch(resetToProfile);
      // SET IN ASYNC STORAGE (lets us remember whether user has signed in or not)
      AsyncStorage.setItem(AsyncStorageKeys.IS_NOT_FIRST_TIME, 'true');
    }
    setIsLoadingAuth(false);
  };

  const signOutUser = async () => {
    console.error('signOutUser');
    setIsLoadingAuth(true);
    const { data: payload } = await KeychainStorage.get();
    const { refreshToken } = payload || {};
    // DELETE REFRESH TOKEN FROM DB
    // get the userId from the jwt
    if (refreshToken) {
      await ApiServices.deleteToken(refreshToken);
    }
    await KeychainStorage.remove();
    setUserInfo(undefined);
    setIsLoadingAuth(false);
  };

  const generateVerificationCode = () => {
    // random string of 12 characters including special characters
    const code = Math.random().toString(36).slice(-12);
    // set a datetime for ten minutes from now
    const expTime = new Date();
    expTime.setMinutes(expTime.getMinutes() + 10);
    setVerificationCode({ code, expTime });
    return code;
  };

  const validateVerificationCode = (
    code: string,
  ): {
    isValid: boolean;
    message?: string;
  } => {
    if (verificationCode?.code !== code) {
      return {
        isValid: false,
        message: 'Invalid verification code',
      };
    }
    if (verificationCode.expTime > new Date()) {
      return {
        isValid: false,
        message: 'Verification code expired',
      };
    }
    return {
      isValid: true,
    };
  };

  return (
    <UserContext.Provider
      value={{
        userId: userInfo?.userId,
        userEmail: userInfo?.email,
        userRole: userInfo?.role,
        signInUser,
        signOutUser,
        verificationCode,
        generateVerificationCode,
        validateVerificationCode,
        isLoadingAuth,
        isNewUser,
        amplifyEnv,
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
};

export const useAuth = () => useContext(UserContext);
