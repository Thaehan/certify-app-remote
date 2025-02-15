/*
 * Copyright (c) 2019 Certis CISCO Security Pte Ltd
 * All rights reserved.
 *
 * This software is the confidential and proprietary information of
 * Certis CISCO Security Pte Ltd. ("Confidential Information").
 * You shall not disclose such Confidential Information and shall use
 * it only in accordance with the terms of the license agreement you
 * entered into with Certis CISCO Security Pte Ltd.
 */
import React from 'react';
import {
    AppRegistry,
    YellowBox,
    Text,
    TextInput,
} from 'react-native';
import { Provider as MobxProvider } from 'mobx-react';
import { Provider as PaperProvider, DefaultTheme, configureFonts } from 'react-native-paper';
import { App } from './src/App';
// import { App } from './example/App';
import { name as appName } from './app.json';
import { RootStore } from './src/stores/RootStore';

YellowBox.ignoreWarnings([
    'Warning: AsyncStorage has been extracted from react-native core',
    'Setting a timer'
]);

/**
 * Context initialization
 *
 * @author Lingqi
 */
const Root = () => {
    Text.defaultProps = { allowFontScaling: false };
    TextInput.defaultProps = { allowFontScaling: false };
    const fontConfig = {
        ios: {
          regular: {
            fontFamily: 'Roboto-Regular',
            fontWeight: 'normal',
          },
          medium: {
            fontFamily: 'Roboto-Medium',
            fontWeight: 'normal',
          },
          light: {
            fontFamily: 'Roboto-Regular',
            fontWeight: 'normal',
          },
          thin: {
            fontFamily: 'Roboto-Regular',
            fontWeight: 'normal',
          },
          "labelMedium": {
       
          },
          "bodyLarge": {
            fontFamily: 'Roboto-Regular',
            fontWeight: 'normal',
          }
        },
        
        android: {
          regular: {
            fontFamily: 'Roboto-Regular',
            fontWeight: 'normal',
          },
          medium: {
            fontFamily: 'Roboto-Medium',
            fontWeight: 'normal',
          },
          light: {
            fontFamily: 'Roboto-Regular',
            fontWeight: 'normal',
          },
          thin: {
            fontFamily: 'Roboto-Regular',
            fontWeight: 'normal',
          },
          labelMedium: {
            fontFamily: 'Roboto-Regular',
            fontWeight: 'normal',
          },
          bodyLarge: {
            fontFamily: 'Roboto-Regular',
            fontWeight: 'normal',
          }
        },
      };
      
      const theme = {
        ...DefaultTheme,
        fonts: configureFonts({config: fontConfig, isV3: false}),
      };
    return (
        <MobxProvider rootStore={new RootStore()}>
            <PaperProvider theme={theme}>
                <App />
            </PaperProvider>
        </MobxProvider>
    );
};

AppRegistry.registerComponent(appName, () => Root);
