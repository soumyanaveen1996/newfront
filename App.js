import React from 'react';
import { MainRouter } from './app/routes/';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

export default class App extends React.Component {
    render() {
        return (
            <ActionSheetProvider>
                <MainRouter />
            </ActionSheetProvider>
        );
    }
}
