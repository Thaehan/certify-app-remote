/*
 * Copyright (c) 2020 Certis CISCO Security Pte Ltd
 * All rights reserved.
 *
 * This software is the confidential and proprietary information of
 * Certis CISCO Security Pte Ltd. ("Confidential Information").
 * You shall not disclose such Confidential Information and shall use
 * it only in accordance with the terms of the license agreement you
 * entered into with Certis CISCO Security Pte Ltd.
 */
import React, { PureComponent } from 'react';
import {
    Text,
    View,
    StyleSheet,
} from 'react-native';
import { inject } from 'mobx-react';
import {
    NavigationScreenProp,
    NavigationRoute,
    NavigationScreenConfig,
    NavigationStackScreenOptions,
} from 'react-navigation';
import { I18n } from '../../../utils/I18n';
import { Colors } from '../../../utils/Colors';
import {
    ALL_LANGUAGES,
    LANGUAGE_MAP,
    Keys,
} from '../../../utils/Constants';
import { Select } from '../../../shared-components/Select';
import { RootStore, AllStores } from '../../../stores/RootStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
    navigation: NavigationScreenProp<NavigationRoute>;
    rootStore: RootStore;
}
interface State {
    currentLang: string;
}

@inject(({ rootStore }: AllStores) => ({
    rootStore,
}))
export class ProfileSettingsScreen extends PureComponent<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            currentLang: I18n.currentLocale()
        };
        this.onSelectLanguage = this.onSelectLanguage.bind(this);
    }

    static navigationOptions: NavigationScreenConfig<NavigationStackScreenOptions> = ({ navigation }) => {
        return {
            title: I18n.t('profile.item.settings'),
        };
    }

    private onSelectLanguage(language: string): void {
        this.props.rootStore.useLang(language);
        this.setState({ currentLang: language });
        AsyncStorage.setItem(Keys.LANGUAGE, language);
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.languageLabel}>
                    {'Current Language'}
                </Text>
                <Select
                    style={styles.languageSelect}
                    triggerTextStyle={styles.languageTriggerText}
                    selectedValue={this.state.currentLang}
                    onValueChange={this.onSelectLanguage}>
                    {ALL_LANGUAGES.map((lang, index) => (
                        <Select.Item
                            key={index}
                            label={LANGUAGE_MAP[lang]}
                            value={lang}
                            selectedColor={Colors.cathyBlue} />
                    ))}
                </Select>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'whitesmoke'
    },
    languageLabel: {
        marginTop: 24,
        marginLeft: 36,
        fontSize: 12,
        fontFamily: 'Roboto-Regular',
        letterSpacing: 0.4,
        lineHeight: 16,
        color: Colors.helperText
    },
    languageSelect: {
        marginTop: 4,
        height: 48,
        marginHorizontal: 24,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: Colors.cathyBlueBorder,
        backgroundColor: 'white',
    },
    languageTriggerText: {
        color: Colors.cathyMajorText
    }
});
